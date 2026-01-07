import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18n } from './i18n.entity';

@Injectable()
export class I18nService {
  constructor(@InjectRepository(I18n) private i18nRepository: Repository<I18n>) {}

  async findAll(locale?: string, module?: string) {
    const qb = this.i18nRepository.createQueryBuilder('i18n');
    if (locale) qb.andWhere('i18n.locale = :locale', { locale });
    if (module) qb.andWhere('i18n.module = :module', { module });
    return qb.getMany();
  }

  async findByLocale(locale: string) {
    const items = await this.i18nRepository.find({ where: { locale } });
    return items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
  }

  async set(key: string, locale: string, value: string, module?: string) {
    let item = await this.i18nRepository.findOne({ where: { key, locale } });
    if (item) {
      item.value = value;
      if (module) item.module = module;
    } else {
      item = this.i18nRepository.create({ key, locale, value, module });
    }
    return this.i18nRepository.save(item);
  }

  async batchSet(items: { key: string; locale: string; value: string; module?: string }[]) {
    const entities = items.map((item) => this.i18nRepository.create(item));
    return this.i18nRepository.save(entities);
  }

  async remove(id: string) {
    await this.i18nRepository.delete(id);
  }
}
