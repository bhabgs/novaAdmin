import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private menusRepository: TreeRepository<Menu>,
  ) {}

  async findAll() {
    return this.menusRepository.findTrees();
  }

  async findOne(id: string) {
    return this.menusRepository.findOne({ where: { id } });
  }

  async create(dto: CreateMenuDto) {
    const menu = this.menusRepository.create(dto);
    if (dto.parentId) {
      menu.parent = await this.menusRepository.findOne({ where: { id: dto.parentId } });
    }
    return this.menusRepository.save(menu);
  }

  async update(id: string, dto: UpdateMenuDto) {
    const menu = await this.menusRepository.findOne({ where: { id } });
    Object.assign(menu, dto);
    if (dto.parentId) {
      menu.parent = await this.menusRepository.findOne({ where: { id: dto.parentId } });
    }
    return this.menusRepository.save(menu);
  }

  async remove(id: string) {
    await this.menusRepository.softDelete(id);
  }
}
