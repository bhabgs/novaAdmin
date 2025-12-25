import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Menu, MenuStatus } from '../menus/entities/menu.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignMenusDto,
  CopyRoleDto,
} from './dto/role.dto';
import { PaginationResult } from '../common/dto/pagination.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async findAll(query: QueryRoleDto): Promise<PaginationResult<Role>> {
    const { page = 1, pageSize = 10, keyword } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    if (keyword) {
      queryBuilder.andWhere(
        '(role.name LIKE :keyword OR role.code LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [list, total] = await queryBuilder
      .orderBy('role.sortOrder', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }

  async findAllWithoutPagination(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code } });
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    // 检查角色编码是否已存在
    const existing = await this.roleRepository.findOne({
      where: [{ name: dto.name }, { code: dto.code }],
    });

    if (existing) {
      if (existing.name === dto.name) {
        throw new ConflictException('角色名称已存在');
      }
      throw new ConflictException('角色编码已存在');
    }

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 检查名称和编码唯一性
    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('角色名称已存在');
      }
    }

    if (dto.code && dto.code !== role.code) {
      const existing = await this.roleRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException('角色编码已存在');
      }
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    await this.roleRepository.delete(id);
  }

  async batchDelete(ids: string[]): Promise<void> {
    await this.roleRepository.delete(ids);
  }

  async assignMenus(id: string, dto: AssignMenusDto): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    role.menuIds = dto.menuIds;
    await this.roleRepository.save(role);
  }

  async getRoleMenus(id: string): Promise<Menu[]> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (!role.menuIds || role.menuIds.length === 0) {
      return [];
    }

    // 返回角色拥有的菜单
    return this.menuRepository.find({
      where: { id: In(role.menuIds) },
      order: { sortOrder: 'ASC' },
    });
  }

  async getMenuTree(): Promise<any[]> {
    // 获取所有激活状态的菜单
    const menus = await this.menuRepository.find({
      where: { status: MenuStatus.ACTIVE },
      order: { sortOrder: 'ASC' },
    });

    // 构建菜单树结构
    return this.buildMenuTree(menus);
  }

  private buildMenuTree(menus: Menu[], parentId?: string): any[] {
    const result: any[] = [];

    for (const menu of menus) {
      if (menu.parentId === parentId || (!menu.parentId && !parentId)) {
        const children = this.buildMenuTree(menus, menu.id);
        result.push({
          key: menu.id,
          title: menu.name,
          icon: menu.icon,
          type: menu.type,
          path: menu.path,
          children: children.length > 0 ? children : undefined,
        });
      }
    }

    return result;
  }

  async copyRole(id: string, dto: CopyRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const newName = dto.name || `${role.name}(副本)`;
    const newCode = `${role.code}_copy_${Date.now()}`;

    const copied = this.roleRepository.create({
      name: newName,
      code: newCode,
      description: role.description,
      menuIds: role.menuIds,
      status: role.status,
      sortOrder: role.sortOrder,
      remark: role.remark,
    });

    return this.roleRepository.save(copied);
  }
}
