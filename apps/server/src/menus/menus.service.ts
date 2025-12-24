import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './entities/menu.entity';
import {
  CreateMenuDto,
  UpdateMenuDto,
  UpdateSortDto,
  CopyMenuDto,
} from './dto/menu.dto';

// 可用图标列表
const availableIcons = [
  'HomeOutlined',
  'DashboardOutlined',
  'UserOutlined',
  'TeamOutlined',
  'SettingOutlined',
  'MenuOutlined',
  'AppstoreOutlined',
  'FileOutlined',
  'FolderOutlined',
  'DatabaseOutlined',
  'SafetyOutlined',
  'LockOutlined',
  'KeyOutlined',
  'ToolOutlined',
  'CodeOutlined',
  'BugOutlined',
  'CloudOutlined',
  'MailOutlined',
  'MessageOutlined',
  'BellOutlined',
  'CalendarOutlined',
  'ClockCircleOutlined',
  'EnvironmentOutlined',
  'GlobalOutlined',
  'LinkOutlined',
  'PictureOutlined',
  'PlayCircleOutlined',
  'SoundOutlined',
  'VideoCameraOutlined',
  'CameraOutlined',
];

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  // 获取扁平菜单列表
  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  // 获取树形菜单结构
  async findTree(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      order: { sortOrder: 'ASC' },
    });

    return this.buildTree(menus);
  }

  // 构建树形结构
  private buildTree(menus: Menu[], parentId?: string): any[] {
    const result: any[] = [];

    for (const menu of menus) {
      if (menu.parentId === parentId || (!menu.parentId && !parentId)) {
        const children = this.buildTree(menus, menu.id);
        const menuWithChildren = {
          ...menu,
          children: children.length > 0 ? children : undefined,
        };
        result.push(menuWithChildren);
      }
    }

    return result;
  }

  async findById(id: string): Promise<Menu | null> {
    return this.menuRepository.findOne({ where: { id } });
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(dto);
    return this.menuRepository.save(menu);
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findById(id);
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async delete(id: string): Promise<void> {
    const menu = await this.findById(id);
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 同时删除子菜单
    await this.deleteWithChildren(id);
  }

  private async deleteWithChildren(parentId: string): Promise<void> {
    // 查找所有子菜单
    const children = await this.menuRepository.find({
      where: { parentId },
    });

    // 递归删除子菜单
    for (const child of children) {
      await this.deleteWithChildren(child.id);
    }

    // 删除当前菜单
    await this.menuRepository.delete(parentId);
  }

  async batchDelete(ids: string[]): Promise<void> {
    // 删除指定菜单及其子菜单
    for (const id of ids) {
      await this.deleteWithChildren(id);
    }
  }

  async updateSort(dto: UpdateSortDto): Promise<void> {
    for (const item of dto.menus) {
      await this.menuRepository.update(item.id, {
        sortOrder: item.sortOrder,
        parentId: item.parentId,
      });
    }
  }

  async copyMenu(id: string, dto: CopyMenuDto): Promise<Menu> {
    const menu = await this.findById(id);
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    const copied = this.menuRepository.create({
      ...menu,
      id: undefined,
      name: `${menu.name}(副本)`,
      parentId: dto.parentId ?? menu.parentId,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.menuRepository.save(copied);
  }

  async getIcons(): Promise<string[]> {
    return availableIcons;
  }
}
