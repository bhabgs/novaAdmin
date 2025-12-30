import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { I18n } from './entities/i18n.entity';
import { I18nModule } from '../i18n-modules/entities/i18n-module.entity';
import {
  CreateI18nDto,
  UpdateI18nDto,
  QueryI18nDto,
} from './dto/i18n.dto';
import { PaginationResult } from '../common/dto/pagination.dto';

@Injectable()
export class I18nService {
  constructor(
    @InjectRepository(I18n)
    private i18nRepository: Repository<I18n>,
    @InjectRepository(I18nModule)
    private i18nModuleRepository: Repository<I18nModule>,
  ) {}

  async findAll(query: QueryI18nDto): Promise<PaginationResult<I18n>> {
    const { page = 1, pageSize = 10, moduleId, keyword } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.i18nRepository
      .createQueryBuilder('i18n')
      .leftJoinAndSelect('i18n.module', 'module');

    if (moduleId) {
      queryBuilder.andWhere('i18n.moduleId = :moduleId', { moduleId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(i18n.key LIKE :keyword OR i18n.zhCn LIKE :keyword OR i18n.enUs LIKE :keyword OR i18n.arSa LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [list, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('i18n.createdAt', 'DESC')
      .getManyAndCount();

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }

  async findById(id: string): Promise<I18n | null> {
    return this.i18nRepository.findOne({
      where: { id },
      relations: ['module'],
    });
  }

  async create(dto: CreateI18nDto): Promise<I18n> {
    // 检查模块是否存在
    const module = await this.i18nModuleRepository.findOne({
      where: { id: dto.moduleId },
    });
    if (!module) {
      throw new NotFoundException('模块不存在');
    }

    // 检查同一模块下键名是否已存在
    const existingI18n = await this.i18nRepository.findOne({
      where: { moduleId: dto.moduleId, key: dto.key },
    });
    if (existingI18n) {
      throw new ConflictException('该模块下键名已存在');
    }

    const i18n = this.i18nRepository.create(dto);
    return this.i18nRepository.save(i18n);
  }

  async update(id: string, dto: UpdateI18nDto): Promise<I18n> {
    const i18n = await this.findById(id);
    if (!i18n) {
      throw new NotFoundException('多语言数据不存在');
    }

    // 如果更新键名，需要检查同一模块下是否已存在
    if (dto.key && dto.key !== i18n.key) {
      const existingI18n = await this.i18nRepository.findOne({
        where: { moduleId: i18n.moduleId, key: dto.key },
      });
      if (existingI18n) {
        throw new ConflictException('该模块下键名已存在');
      }
    }

    Object.assign(i18n, dto);
    return this.i18nRepository.save(i18n);
  }

  async delete(id: string): Promise<void> {
    const i18n = await this.findById(id);
    if (!i18n) {
      throw new NotFoundException('多语言数据不存在');
    }

    await this.i18nRepository.delete(id);
  }

  async batchDelete(ids: string[]): Promise<void> {
    await this.i18nRepository.delete(ids);
  }

  /**
   * 翻译文本（使用简单的翻译服务）
   * 注意：这是一个简单的实现，生产环境建议使用专业的翻译 API
   */
  async translateText(
    text: string,
    from: string,
    to: string,
  ): Promise<string> {
    // 如果源语言和目标语言相同，直接返回
    if (from === to) {
      return text;
    }

    // 这里可以使用第三方翻译 API，如 Google Translate、百度翻译等
    // 为了演示，这里使用一个简单的实现
    // 生产环境建议配置专业的翻译服务
    
    try {
      // 使用 Google Translate 的免费接口（需要代理或配置 API Key）
      // 或者使用其他翻译服务
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from.split('-')[0]}&tl=${to.split('-')[0]}&dt=t&q=${encodeURIComponent(text)}`,
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          return data[0].map((item: any[]) => item[0]).join('');
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    }

    // 如果翻译失败，返回原文本
    return text;
  }

  /**
   * 获取所有翻译，转换为 i18next 格式
   * 返回格式: { 'zh-CN': { translation: {...} }, 'en-US': { translation: {...} }, 'ar-SA': { translation: {...} } }
   */
  async getAllTranslations(): Promise<{
    'zh-CN': Record<string, string>;
    'en-US': Record<string, string>;
    'ar-SA': Record<string, string>;
  }> {
    const allI18ns = await this.i18nRepository.find({
      relations: ['module'],
    });

    const translations = {
      'zh-CN': {} as Record<string, string>,
      'en-US': {} as Record<string, string>,
      'ar-SA': {} as Record<string, string>,
    };

    // 将数据库中的翻译转换为 i18next 格式
    // 格式: module.key -> value
    for (const i18n of allI18ns) {
      const moduleCode = i18n.module?.code || 'common';
      const key = `${moduleCode}.${i18n.key}`;

      translations['zh-CN'][key] = i18n.zhCn;
      translations['en-US'][key] = i18n.enUs;
      translations['ar-SA'][key] = i18n.arSa;
    }

    return translations;
  }

  /**
   * 批量导入国际化数据
   * @param importData 导入数据
   * @param overwrite 是否覆盖已存在的数据
   */
  async importI18nData(
    importData: Array<{
      module: string;
      key: string;
      zhCn: string;
      enUs: string;
      arSa: string;
    }>,
    modules?: Array<{
      code: string;
      name: string;
      description?: string;
    }>,
    overwrite: boolean = false,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{ module: string; key: string; error: string }>;
  }> {
    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ module: string; key: string; error: string }>,
    };

    // 先创建或更新模块
    const moduleMap = new Map<string, I18nModule>();
    if (modules && modules.length > 0) {
      for (const moduleData of modules) {
        try {
          let module = await this.i18nModuleRepository.findOne({
            where: { code: moduleData.code },
          });

          if (!module) {
            module = this.i18nModuleRepository.create({
              code: moduleData.code,
              name: moduleData.name,
              description: moduleData.description,
            });
            module = await this.i18nModuleRepository.save(module);
          } else {
            // 更新模块信息
            module.name = moduleData.name;
            if (moduleData.description !== undefined) {
              module.description = moduleData.description;
            }
            module = await this.i18nModuleRepository.save(module);
          }

          moduleMap.set(moduleData.code, module);
        } catch (error) {
          console.error(`Error creating/updating module ${moduleData.code}:`, error);
        }
      }
    }

    // 处理每个国际化项
    for (const item of importData) {
      try {
        // 查找或创建模块
        let module = moduleMap.get(item.module);
        if (!module) {
          const foundModule = await this.i18nModuleRepository.findOne({
            where: { code: item.module },
          });

          if (foundModule) {
            module = foundModule;
          } else {
            // 如果模块不存在且没有在 modules 中定义，创建一个默认模块
            module = this.i18nModuleRepository.create({
              code: item.module,
              name: item.module.charAt(0).toUpperCase() + item.module.slice(1),
              description: `${item.module} 模块`,
            });
            module = await this.i18nModuleRepository.save(module);
          }
          moduleMap.set(item.module, module);
        }

        // 查找是否已存在
        const existingI18n = await this.i18nRepository.findOne({
          where: { moduleId: module.id, key: item.key },
        });

        if (existingI18n) {
          if (overwrite) {
            // 更新现有数据
            existingI18n.zhCn = item.zhCn;
            existingI18n.enUs = item.enUs;
            existingI18n.arSa = item.arSa;
            await this.i18nRepository.save(existingI18n);
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          // 创建新数据
          const newI18n = this.i18nRepository.create({
            moduleId: module.id,
            key: item.key,
            zhCn: item.zhCn,
            enUs: item.enUs,
            arSa: item.arSa,
          });
          await this.i18nRepository.save(newI18n);
          result.created++;
        }
      } catch (error) {
        result.errors.push({
          module: item.module,
          key: item.key,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(
          `Error importing i18n item ${item.module}.${item.key}:`,
          error,
        );
      }
    }

    return result;
  }
}

