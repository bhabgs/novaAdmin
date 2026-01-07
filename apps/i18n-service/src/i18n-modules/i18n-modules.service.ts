import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { I18nModule } from './entities/i18n-module.entity';
import {
  CreateI18nModuleDto,
  UpdateI18nModuleDto,
  QueryI18nModuleDto,
} from './dto/i18n-module.dto';
import { PaginationResult } from '@nova-admin/shared';

@Injectable()
export class I18nModulesService {
  constructor(
    @InjectRepository(I18nModule)
    private i18nModuleRepository: Repository<I18nModule>,
  ) {}

  async findAll(query: QueryI18nModuleDto): Promise<PaginationResult<I18nModule>> {
    const { page = 1, pageSize = 10, keyword } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.i18nModuleRepository.createQueryBuilder('module');

    if (keyword) {
      queryBuilder.andWhere(
        '(module.code LIKE :keyword OR module.name LIKE :keyword OR module.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [list, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('module.createdAt', 'DESC')
      .getManyAndCount();

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }

  async findById(id: string): Promise<I18nModule | null> {
    return this.i18nModuleRepository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<I18nModule | null> {
    return this.i18nModuleRepository.findOne({
      where: { code },
    });
  }

  async create(dto: CreateI18nModuleDto): Promise<I18nModule> {
    // 检查模块代码是否已存在
    const existingModule = await this.findByCode(dto.code);
    if (existingModule) {
      throw new ConflictException('模块代码已存在');
    }

    const module = this.i18nModuleRepository.create(dto);
    return this.i18nModuleRepository.save(module);
  }

  async update(id: string, dto: UpdateI18nModuleDto): Promise<I18nModule> {
    const module = await this.findById(id);
    if (!module) {
      throw new NotFoundException('模块不存在');
    }

    Object.assign(module, dto);
    return this.i18nModuleRepository.save(module);
  }

  async delete(id: string): Promise<void> {
    const module = await this.findById(id);
    if (!module) {
      throw new NotFoundException('模块不存在');
    }

    await this.i18nModuleRepository.delete(id);
  }

  async batchDelete(ids: string[]): Promise<void> {
    await this.i18nModuleRepository.delete(ids);
  }
}

