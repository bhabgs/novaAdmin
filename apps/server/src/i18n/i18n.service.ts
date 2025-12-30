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
}

