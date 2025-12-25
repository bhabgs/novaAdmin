import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  AssignRolesDto,
  UpdateStatusDto,
} from './dto/user.dto';
import { PaginationResult } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: QueryUserDto): Promise<PaginationResult<User>> {
    const { page = 1, pageSize = 10, keyword, status, role } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.name LIKE :keyword OR user.email LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (role) {
      queryBuilder.andWhere('role.id = :roleId', { roleId: role });
    }

    const [list, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // 移除密码字段
    const sanitizedList = list.map(({ password, ...user }) => user as User);

    return {
      list: sanitizedList,
      pagination: { page, pageSize, total },
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException('用户名已存在');
      }
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 获取角色
    let roles: Role[] = [];
    if (dto.roleIds && dto.roleIds.length > 0) {
      roles = await this.roleRepository.find({
        where: { id: In(dto.roleIds) },
      });
    }

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      roles,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户名和邮箱唯一性
    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException('用户名已存在');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 如果更新密码，需要加密
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // 获取角色
    if (dto.roleIds) {
      const roles = await this.roleRepository.find({
        where: { id: In(dto.roleIds) },
      });
      user.roles = roles;
    }

    Object.assign(user, dto);
    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async delete(id: string): Promise<void> {
    // 不能删除ID为1的管理员用户
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否为超级管理员
    if (user.roles?.some((role) => role.code === 'admin')) {
      throw new BadRequestException('不能删除管理员用户');
    }

    await this.userRepository.delete(id);
  }

  async batchDelete(ids: string[]): Promise<void> {
    // 过滤掉管理员用户
    const users = await this.userRepository.find({
      where: { id: In(ids) },
      relations: ['roles'],
    });

    const deleteIds = users
      .filter((user) => !user.roles?.some((role) => role.code === 'admin'))
      .map((user) => user.id);

    if (deleteIds.length > 0) {
      await this.userRepository.delete(deleteIds);
    }
  }

  async resetPassword(id: string): Promise<{ password: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(id, { password: hashedPassword });

    return { password: newPassword };
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 不能禁用管理员
    if (
      dto.status !== UserStatus.ACTIVE &&
      user.roles?.some((role) => role.code === 'admin')
    ) {
      throw new BadRequestException('不能禁用管理员用户');
    }

    await this.userRepository.update(id, { status: dto.status });
  }

  async assignRoles(id: string, dto: AssignRolesDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const roles = await this.roleRepository.find({
      where: { id: In(dto.roleIds) },
    });

    user.roles = roles;
    await this.userRepository.save(user);
  }

  async getUserPermissions(id: string): Promise<string[]> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 合并用户通过角色拥有的菜单ID
    const menuIds = new Set<string>();
    user.roles?.forEach((role) => {
      if (role.menuIds && role.menuIds.length > 0) {
        role.menuIds.forEach((menuId: string) => menuIds.add(menuId));
      }
    });

    return Array.from(menuIds);
  }

  async updateLastLoginTime(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginTime: new Date() });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: hashedPassword });
  }
}
