import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18n } from './i18n.entity';
import { DictItem } from '../dict/dict-item.entity';

type LocaleField = 'zhCN' | 'enUS' | 'arSA';

const LOCALE_MAP: Record<string, LocaleField> = {
  'zh-CN': 'zhCN',
  'en-US': 'enUS',
  'ar-SA': 'arSA',
};

@Injectable()
export class I18nService {
  constructor(
    @InjectRepository(I18n) private i18nRepository: Repository<I18n>,
    @InjectRepository(DictItem) private dictItemRepository: Repository<DictItem>,
  ) {}

  async findAll(module?: string) {
    const qb = this.i18nRepository.createQueryBuilder('i18n');
    if (module) qb.andWhere('i18n.module = :module', { module });
    return qb.getMany();
  }

  async findByLocale(locale: string) {
    const field = LOCALE_MAP[locale];
    if (!field) return {};
    const items = await this.i18nRepository.find();
    return items.reduce((acc, item) => {
      // 如果有模块，使用 module.key 格式；否则直接使用 key
      const fullKey = item.module ? `${item.module}.${item.key}` : item.key;
      return { ...acc, [fullKey]: item[field] };
    }, {});
  }

  async set(key: string, zhCN?: string, enUS?: string, arSA?: string, module?: string) {
    let item = await this.i18nRepository.findOne({ where: { key } });
    if (item) {
      if (zhCN !== undefined) item.zhCN = zhCN;
      if (enUS !== undefined) item.enUS = enUS;
      if (arSA !== undefined) item.arSA = arSA;
      if (module !== undefined) item.module = module;
    } else {
      item = this.i18nRepository.create({ key, zhCN, enUS, arSA, module });
    }
    return this.i18nRepository.save(item);
  }

  async batchSet(items: { key: string; zhCN?: string; enUS?: string; arSA?: string; module?: string }[]) {
    const results = [];
    for (const item of items) {
      results.push(await this.set(item.key, item.zhCN, item.enUS, item.arSA, item.module));
    }
    return results;
  }

  async remove(id: string) {
    await this.i18nRepository.delete(id);
  }

  async getModules() {
    // 从字典表获取 i18n_module 类型的所有字典项
    const items = await this.dictItemRepository.find({
      where: { dictTypeCode: 'i18n_module', status: 1 },
      order: { sort: 'ASC' },
    });
    return items.map((item) => item.value);
  }
}
