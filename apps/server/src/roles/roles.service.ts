import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Role } from './entities/role.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignPermissionsDto,
  CopyRoleDto,
} from './dto/role.dto';
import { PaginationResult } from '../common/dto/pagination.dto';

// 预定义权限列表
const defaultPermissions = [
  { id: '1', code: 'system:user:list', name: '用户列表', type: 'menu' },
  { id: '2', code: 'system:user:create', name: '创建用户', type: 'button' },
  { id: '3', code: 'system:user:update', name: '编辑用户', type: 'button' },
  { id: '4', code: 'system:user:delete', name: '删除用户', type: 'button' },
  { id: '5', code: 'system:role:list', name: '角色列表', type: 'menu' },
  { id: '6', code: 'system:role:create', name: '创建角色', type: 'button' },
  { id: '7', code: 'system:role:update', name: '编辑角色', type: 'button' },
  { id: '8', code: 'system:role:delete', name: '删除角色', type: 'button' },
  { id: '9', code: 'system:menu:list', name: '菜单列表', type: 'menu' },
  { id: '10', code: 'system:menu:create', name: '创建菜单', type: 'button' },
  { id: '11', code: 'system:menu:update', name: '编辑菜单', type: 'button' },
  { id: '12', code: 'system:menu:delete', name: '删除菜单', type: 'button' },
];

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
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

  async assignPermissions(id: string, dto: AssignPermissionsDto): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    role.permissions = dto.permissionIds;
    await this.roleRepository.save(role);
  }

  async getRolePermissions(id: string): Promise<any[]> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 返回角色拥有的权限详情
    return defaultPermissions.filter((p) =>
      role.permissions?.includes(p.code),
    );
  }

  async getPermissions(): Promise<any[]> {
    return defaultPermissions;
  }

  async getPermissionTree(): Promise<any[]> {
    // 构建权限树结构
    const tree = [
      {
        id: 'system',
        name: '系统管理',
        code: 'system',
        children: [
          {
            id: 'system:user',
            name: '用户管理',
            code: 'system:user',
            children: defaultPermissions
              .filter((p) => p.code.startsWith('system:user:'))
              .map((p) => ({ ...p, children: [] })),
          },
          {
            id: 'system:role',
            name: '角色管理',
            code: 'system:role',
            children: defaultPermissions
              .filter((p) => p.code.startsWith('system:role:'))
              .map((p) => ({ ...p, children: [] })),
          },
          {
            id: 'system:menu',
            name: '菜单管理',
            code: 'system:menu',
            children: defaultPermissions
              .filter((p) => p.code.startsWith('system:menu:'))
              .map((p) => ({ ...p, children: [] })),
          },
        ],
      },
    ];

    return tree;
  }

  async copyRole(id: string, dto: CopyRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const newName = dto.name || `${role.name}(副本)`;
    const newCode = `${role.code}_copy_${Date.now()}`;

    const copied = this.roleRepository.create({
      ...role,
      id: undefined,
      name: newName,
      code: newCode,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.roleRepository.save(copied);
  }
}
