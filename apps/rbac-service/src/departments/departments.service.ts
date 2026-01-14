import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private departmentsRepository: TreeRepository<Department>,
  ) {}

  async findAll() {
    return this.departmentsRepository.findTrees();
  }

  async findOne(id: string) {
    return this.departmentsRepository.findOne({ where: { id } });
  }

  async create(dto: CreateDepartmentDto) {
    const department = this.departmentsRepository.create(dto);
    if (dto.parentId) {
      department.parent = await this.departmentsRepository.findOne({ where: { id: dto.parentId } });
    }
    return this.departmentsRepository.save(department);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.departmentsRepository.findOne({ where: { id } });
    Object.assign(department, dto);
    if (dto.parentId) {
      department.parent = await this.departmentsRepository.findOne({ where: { id: dto.parentId } });
    }
    return this.departmentsRepository.save(department);
  }

  async remove(id: string) {
    await this.departmentsRepository.softDelete(id);
  }
}
