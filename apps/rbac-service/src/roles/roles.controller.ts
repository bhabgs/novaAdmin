import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from './dto/role.dto';
import { PaginationDto, BatchDeleteDto } from '@nova-admin/shared';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get roles list' })
  findAll(@Query() query: QueryRoleDto & PaginationDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete('batch')
  @ApiOperation({ summary: 'Batch delete roles' })
  batchRemove(@Body() dto: BatchDeleteDto) {
    return this.rolesService.batchRemove(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
