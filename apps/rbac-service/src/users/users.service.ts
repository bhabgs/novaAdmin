import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';
import { PaginationDto } from '@nova-admin/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}

  async findAll(query: QueryUserDto & PaginationDto) {
    const { page = 1, pageSize = 10, username, status } = query;
    const qb = this.usersRepository.createQueryBuilder('user').leftJoinAndSelect('user.roles', 'role');

    if (username) qb.andWhere('user.username LIKE :username', { username: `%${username}%` });
    if (status !== undefined) qb.andWhere('user.status = :status', { status });

    const [list, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list, total, page, pageSize };
  }

  async findOne(id: string) {
    return this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, password: hashedPassword });
    if (dto.roleIds?.length) {
      user.roles = await this.rolesRepository.findByIds(dto.roleIds);
    }
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, dto);
    if (dto.roleIds) {
      user.roles = await this.rolesRepository.findByIds(dto.roleIds);
    }
    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    await this.usersRepository.softDelete(id);
  }

  async batchRemove(ids: string[]) {
    await this.usersRepository.softDelete(ids);
  }
}
