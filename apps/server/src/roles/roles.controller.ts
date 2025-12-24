import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignPermissionsDto,
  BatchDeleteDto,
  CopyRoleDto,
} from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表（分页）' })
  async findAll(@Query() query: QueryRoleDto) {
    return this.rolesService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有角色（不分页）' })
  async findAllWithoutPagination() {
    return this.rolesService.findAllWithoutPagination();
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取所有权限' })
  async getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get('permissions/tree')
  @ApiOperation({ summary: '获取权限树' })
  async getPermissionTree() {
    return this.rolesService.getPermissionTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  async delete(@Param('id') id: string) {
    await this.rolesService.delete(id);
    return null;
  }

  @Post('batch')
  @ApiOperation({ summary: '批量删除角色' })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    await this.rolesService.batchDelete(dto.ids);
    return null;
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: '分配权限' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    await this.rolesService.assignPermissions(id, dto);
    return null;
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取角色权限' })
  async getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: '复制角色' })
  async copyRole(@Param('id') id: string, @Body() dto: CopyRoleDto) {
    return this.rolesService.copyRole(id, dto);
  }
}
