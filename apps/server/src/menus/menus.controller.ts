import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  BatchDeleteDto,
  UpdateSortDto,
  CopyMenuDto,
} from './dto/menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('菜单管理')
@Controller('menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: '获取菜单列表（扁平）' })
  async findAll() {
    return this.menusService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
  async findTree() {
    return this.menusService.findTree();
  }

  @Get('icons')
  @ApiOperation({ summary: '获取图标列表' })
  async getIcons() {
    return this.menusService.getIcons();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  async findOne(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  async delete(@Param('id') id: string) {
    await this.menusService.delete(id);
    return null;
  }

  @Post('batch')
  @ApiOperation({ summary: '批量删除菜单' })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    await this.menusService.batchDelete(dto.ids);
    return null;
  }

  @Put('sort')
  @ApiOperation({ summary: '更新菜单排序' })
  async updateSort(@Body() dto: UpdateSortDto) {
    await this.menusService.updateSort(dto);
    return null;
  }

  @Post(':id/copy')
  @ApiOperation({ summary: '复制菜单' })
  async copyMenu(@Param('id') id: string, @Body() dto: CopyMenuDto) {
    return this.menusService.copyMenu(id, dto);
  }
}
