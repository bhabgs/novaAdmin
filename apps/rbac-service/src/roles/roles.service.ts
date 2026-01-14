import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Menu } from '../menus/menu.entity';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from './dto/role.dto';
import { PaginationDto } from '@nova-admin/shared';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Menu) private menusRepository: Repository<Menu>,
  ) {}

  async findAll(query: QueryRoleDto & PaginationDto) {
    const { page = 1, pageSize = 10, name, status } = query;
    const qb = this.rolesRepository.createQueryBuilder('role');

    if (name) qb.andWhere('role.name LIKE :name', { name: `%${name}%` });
    if (status !== undefined) qb.andWhere('role.status = :status', { status });

    qb.orderBy('role.sort', 'ASC');
    const [list, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list, total, page, pageSize };
  }

  async findOne(id: string) {
    return this.rolesRepository.findOne({ where: { id }, relations: ['menus'] });
  }

  async create(dto: CreateRoleDto) {
    const role = this.rolesRepository.create(dto);
    if (dto.menuIds?.length) {
      role.menus = await this.menusRepository.findByIds(dto.menuIds);
    }
    return this.rolesRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    Object.assign(role, dto);
    if (dto.menuIds) {
      role.menus = await this.menusRepository.findByIds(dto.menuIds);
    }
    return this.rolesRepository.save(role);
  }

  async remove(id: string) {
    await this.rolesRepository.softDelete(id);
  }

  async batchRemove(ids: string[]) {
    await this.rolesRepository.softDelete(ids);
  }
}
