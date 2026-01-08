import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from './dict-type.entity';
import { DictItem } from './dict-item.entity';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictItem)
    private dictItemRepository: Repository<DictItem>,
  ) {}

  // ========== 字典类型 ==========
  async findAllTypes() {
    return this.dictTypeRepository.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findTypeByCode(code: string) {
    return this.dictTypeRepository.findOne({ where: { code } });
  }

  async createType(data: Partial<DictType>) {
    const dictType = this.dictTypeRepository.create(data);
    return this.dictTypeRepository.save(dictType);
  }

  async updateType(id: string, data: Partial<DictType>) {
    await this.dictTypeRepository.update(id, data);
    return this.dictTypeRepository.findOne({ where: { id } });
  }

  async removeType(id: string) {
    // 删除字典类型时，级联删除字典项
    const dictType = await this.dictTypeRepository.findOne({ where: { id } });
    if (dictType) {
      await this.dictItemRepository.delete({ dictTypeCode: dictType.code });
      await this.dictTypeRepository.delete(id);
    }
  }

  // ========== 字典项 ==========
  async findItemsByTypeCode(dictTypeCode: string) {
    return this.dictItemRepository.find({
      where: { dictTypeCode },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAllItems() {
    return this.dictItemRepository.find({
      order: { dictTypeCode: 'ASC', sort: 'ASC' },
    });
  }

  async createItem(data: Partial<DictItem>) {
    const dictItem = this.dictItemRepository.create(data);
    return this.dictItemRepository.save(dictItem);
  }

  async updateItem(id: string, data: Partial<DictItem>) {
    await this.dictItemRepository.update(id, data);
    return this.dictItemRepository.findOne({ where: { id } });
  }

  async removeItem(id: string) {
    await this.dictItemRepository.delete(id);
  }

  async batchRemoveItems(ids: string[]) {
    await this.dictItemRepository.delete(ids);
  }
}
