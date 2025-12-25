import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { I18nTranslation, Language } from './entities/i18n-translation.entity';
import {
  CreateI18nTranslationDto,
  UpdateI18nTranslationDto,
  QueryI18nTranslationDto,
  BatchImportDto,
} from './dto';
import { JsonParser } from './utils/json-parser.util';

interface PaginationResult<T> {
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
    const { page = 1, pageSize = 50, language, module, keyword } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.translationRepository.createQueryBuilder('t');

    if (language) {
      queryBuilder.andWhere('t.language = :language', { language });
    }

    if (module) {
      queryBuilder.andWhere('t.module = :module', { module });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(t.key LIKE :keyword OR t.value LIKE :keyword)',
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
      where: { language },
      order: { module: 'ASC', key: 'ASC' },
    });

    return JsonParser.unflattenJson(translations);
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
    // 检查是否已存在
    const existing = await this.translationRepository.findOne({
      where: {
        language: dto.language,
        module: dto.module,
        key: dto.key,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `该翻译已存在 (${dto.language} - ${dto.module}.${dto.key})`,
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

    // 如果修改了language/module/key，检查是否重复
    if (
      dto.language ||
      dto.module ||
      dto.key
    ) {
      const conflicting = await this.translationRepository.findOne({
        where: {
          language: dto.language || translation.language,
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
   */
  async importFromJson(dto: BatchImportDto): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const { language, translations, overwrite } = dto;

    // 验证JSON格式
    if (!JsonParser.validateJson(translations)) {
      throw new BadRequestException('JSON格式无效');
    }

    // 扁平化JSON
    const flatData = JsonParser.flattenJson(translations, language);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const item of flatData) {
      try {
        const existing = await this.translationRepository.findOne({
          where: {
            language: item.language,
            module: item.module,
            key: item.key,
          },
        });

        if (existing) {
          if (overwrite) {
            await this.translationRepository.update(existing.id, {
              value: item.value,
            });
            updated++;
          }
          // 如果不覆盖，跳过
        } else {
          await this.translationRepository.save(item);
          created++;
        }
      } catch (error) {
        errors.push(
          `导入失败 (${item.module}.${item.key}): ${error.message}`,
        );
      }
    }

    return { created, updated, errors };
  }

  /**
   * 导出为JSON格式
   */
  async exportToJson(language: Language): Promise<Record<string, any>> {
    const translations = await this.translationRepository.find({
      where: { language },
    });

    return JsonParser.unflattenJson(translations);
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
      order: { language: 'ASC', key: 'ASC' },
    });

    const result: Record<Language, Record<string, string>> = {
      [Language.ZH_CN]: {},
      [Language.EN_US]: {},
      [Language.AR_SA]: {},
    };

    for (const trans of translations) {
      if (!result[trans.language]) {
        result[trans.language] = {};
      }
      result[trans.language][trans.key] = trans.value;
    }

    return result;
  }
}
