import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { I18nTranslation, Language } from './entities/i18n-translation.entity';
import {
  CreateI18nTranslationDto,
  UpdateI18nTranslationDto,
  QueryI18nTranslationDto,
  BatchImportDto,
} from './dto';

export interface PaginationResult<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

@Injectable()
export class I18nService {
  constructor(
    @InjectRepository(I18nTranslation)
    private translationRepository: Repository<I18nTranslation>,
  ) {}

  /**
   * 分页获取翻译列表（管理界面用）
   */
  async findAll(
    query: QueryI18nTranslationDto,
  ): Promise<PaginationResult<I18nTranslation>> {
    const { page = 1, pageSize = 50, module, keyword } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.translationRepository.createQueryBuilder('t');

    if (module) {
      queryBuilder.andWhere('t.module = :module', { module });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(t.key LIKE :keyword OR t.zhCN LIKE :keyword OR t.enUS LIKE :keyword OR t.arSA LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [list, total] = await queryBuilder
      .orderBy('t.module', 'ASC')
      .addOrderBy('t.key', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }

  /**
   * 获取指定语言的所有翻译（嵌套格式，i18next兼容）
   */
  async getNestedTranslations(language: Language): Promise<Record<string, any>> {
    const translations = await this.translationRepository.find({
      order: { module: 'ASC', key: 'ASC' },
    });

    // 将新格式转换为嵌套对象
    const result: Record<string, any> = {};

    for (const trans of translations) {
      const langKey = this.getLanguageField(language);
      const value = trans[langKey];

      if (!result[trans.module]) {
        result[trans.module] = {};
      }

      // 支持嵌套键名（如 user.title）
      const keys = trans.key.split('.');
      let current = result[trans.module];

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
    }

    return result;
  }

  /**
   * 获取所有语言的翻译（前端一次性加载）
   */
  async getAllTranslations(): Promise<Record<Language, Record<string, any>>> {
    const languages = Object.values(Language);
    const result: Record<Language, Record<string, any>> = {} as any;

    for (const lang of languages) {
      result[lang] = await this.getNestedTranslations(lang);
    }

    return result;
  }

  /**
   * 获取单个翻译
   */
  async findById(id: string): Promise<I18nTranslation> {
    const translation = await this.translationRepository.findOne({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException(`翻译记录 ${id} 不存在`);
    }

    return translation;
  }

  /**
   * 创建翻译
   */
  async create(dto: CreateI18nTranslationDto): Promise<I18nTranslation> {
    // 检查是否已存在（只检查 module + key）
    const existing = await this.translationRepository.findOne({
      where: {
        module: dto.module,
        key: dto.key,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `该翻译已存在 (${dto.module}.${dto.key})`,
      );
    }

    const translation = this.translationRepository.create(dto);
    return this.translationRepository.save(translation);
  }

  /**
   * 更新翻译
   */
  async update(
    id: string,
    dto: UpdateI18nTranslationDto,
  ): Promise<I18nTranslation> {
    const translation = await this.findById(id);

    // 如果修改了 module/key，检查是否重复
    if (dto.module || dto.key) {
      const conflicting = await this.translationRepository.findOne({
        where: {
          module: dto.module || translation.module,
          key: dto.key || translation.key,
        },
      });

      if (conflicting && conflicting.id !== id) {
        throw new BadRequestException('该翻译已存在');
      }
    }

    Object.assign(translation, dto);
    return this.translationRepository.save(translation);
  }

  /**
   * 删除翻译
   */
  async delete(id: string): Promise<void> {
    const translation = await this.findById(id);
    await this.translationRepository.remove(translation);
  }

  /**
   * 批量删除
   */
  async batchDelete(ids: string[]): Promise<number> {
    const result = await this.translationRepository.delete({ id: In(ids) });
    return result.affected || 0;
  }

  /**
   * 从JSON格式批量导入
   * 数据格式：{ 'zh-CN': { common: { appName: 'xxx' } }, 'en-US': { ... } }
   */
  async importFromJson(dto: BatchImportDto): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const { data, overwrite } = dto;

    if (!data || typeof data !== 'object') {
      throw new BadRequestException('JSON格式无效');
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    // 按语言分组的数据合并为按 module.key 分组
    const mergedData = this.mergeTranslationsByKey(data);

    for (const [moduleKey, translations] of Object.entries(mergedData)) {
      const [module, key] = moduleKey.split(':');

      try {
        const existing = await this.translationRepository.findOne({
          where: { module, key },
        });

        if (existing) {
          if (overwrite) {
            await this.translationRepository.update(existing.id, {
              zhCN: translations.zhCN || existing.zhCN,
              enUS: translations.enUS || existing.enUS,
              arSA: translations.arSA || existing.arSA,
            });
            updated++;
          }
        } else {
          await this.translationRepository.save({
            module,
            key,
            zhCN: translations.zhCN || '',
            enUS: translations.enUS || '',
            arSA: translations.arSA || '',
          });
          created++;
        }
      } catch (error) {
        errors.push(
          `导入失败 (${module}.${key}): ${error.message}`,
        );
      }
    }

    return { created, updated, errors };
  }

  /**
   * 导出为JSON格式
   */
  async exportToJson(language: Language): Promise<Record<string, any>> {
    return this.getNestedTranslations(language);
  }

  /**
   * 获取所有模块名称
   */
  async getModules(): Promise<string[]> {
    const result = await this.translationRepository
      .createQueryBuilder('t')
      .select('DISTINCT t.module', 'module')
      .orderBy('t.module', 'ASC')
      .getRawMany();

    return result.map((r) => r.module);
  }

  /**
   * 获取指定模块的所有翻译
   */
  async getTranslationsByModule(
    module: string,
  ): Promise<Record<Language, Record<string, string>>> {
    const translations = await this.translationRepository.find({
      where: { module },
      order: { key: 'ASC' },
    });

    const result: Record<Language, Record<string, string>> = {
      [Language.ZH_CN]: {},
      [Language.EN_US]: {},
      [Language.AR_SA]: {},
    };

    for (const trans of translations) {
      result[Language.ZH_CN][trans.key] = trans.zhCN;
      result[Language.EN_US][trans.key] = trans.enUS;
      result[Language.AR_SA][trans.key] = trans.arSA;
    }

    return result;
  }

  /**
   * 辅助方法：根据语言获取对应的字段名
   */
  private getLanguageField(language: Language): 'zhCN' | 'enUS' | 'arSA' {
    switch (language) {
      case Language.ZH_CN:
        return 'zhCN';
      case Language.EN_US:
        return 'enUS';
      case Language.AR_SA:
        return 'arSA';
      default:
        return 'zhCN';
    }
  }

  /**
   * 辅助方法：将按语言分组的翻译数据合并为按 module:key 分组
   * 输入：{ 'zh-CN': { common: { appName: 'xxx' } }, 'en-US': { common: { appName: 'yyy' } } }
   * 输出：{ 'common:appName': { zhCN: 'xxx', enUS: 'yyy' } }
   */
  private mergeTranslationsByKey(
    data: Record<string, Record<string, any>>,
  ): Record<string, { zhCN?: string; enUS?: string; arSA?: string }> {
    const result: Record<string, { zhCN?: string; enUS?: string; arSA?: string }> = {};

    for (const [language, modules] of Object.entries(data)) {
      const langField = this.getLanguageField(language as Language);

      for (const [module, keys] of Object.entries(modules)) {
        this.flattenObject(keys, module, '', (key, value) => {
          const mapKey = `${module}:${key}`;
          if (!result[mapKey]) {
            result[mapKey] = {};
          }
          result[mapKey][langField] = value;
        });
      }
    }

    return result;
  }

  /**
   * 辅助方法：扁平化嵌套对象
   */
  private flattenObject(
    obj: any,
    module: string,
    prefix: string,
    callback: (key: string, value: string) => void,
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, module, fullKey, callback);
      } else {
        callback(fullKey, String(value));
      }
    }
  }
}
