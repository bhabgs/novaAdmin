import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  AssignRolesDto,
  UpdateStatusDto,
  BatchDeleteDto,
} from './dto/user.dto';
@ApiTags('用户管理')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return null;
  }

  @Post('batch')
  @ApiOperation({ summary: '批量删除用户' })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    await this.usersService.batchDelete(dto.ids);
    return null;
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新用户状态' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    await this.usersService.updateStatus(id, dto);
    return null;
  }

  @Post(':id/roles')
  @ApiOperation({ summary: '分配角色' })
  async assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    await this.usersService.assignRoles(id, dto);
    return null;
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: '获取用户权限' })
  async getUserPermissions(@Param('id') id: string) {
    return this.usersService.getUserPermissions(id);
  }
}
