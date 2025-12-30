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
import { I18nModulesService } from './i18n-modules.service';
import {
  CreateI18nModuleDto,
  UpdateI18nModuleDto,
  QueryI18nModuleDto,
} from './dto/i18n-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BatchDeleteDto } from '../common/dto/batch-delete.dto';

@ApiTags('多语言模块管理')
@Controller('i18n-modules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class I18nModulesController {
  constructor(private i18nModulesService: I18nModulesService) {}

  @Get()
  @ApiOperation({ summary: '获取多语言模块列表' })
  async findAll(@Query() query: QueryI18nModuleDto) {
    return this.i18nModulesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取多语言模块详情' })
  async findOne(@Param('id') id: string) {
    return this.i18nModulesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建多语言模块' })
  async create(@Body() dto: CreateI18nModuleDto) {
    return this.i18nModulesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新多语言模块' })
  async update(@Param('id') id: string, @Body() dto: UpdateI18nModuleDto) {
    return this.i18nModulesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除多语言模块' })
  async delete(@Param('id') id: string) {
    await this.i18nModulesService.delete(id);
    return null;
  }

  @Post('batch')
  @ApiOperation({ summary: '批量删除多语言模块' })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    await this.i18nModulesService.batchDelete(dto.ids);
    return null;
  }
}

