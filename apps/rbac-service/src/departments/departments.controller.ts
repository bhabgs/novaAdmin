import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get departments tree' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create department' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
