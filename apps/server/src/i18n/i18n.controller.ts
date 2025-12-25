import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { I18nService } from './i18n.service';
import { I18nTranslation, Language } from './entities/i18n-translation.entity';
import {
  CreateI18nTranslationDto,
  UpdateI18nTranslationDto,
  QueryI18nTranslationDto,
  BatchImportDto,
  BatchDeleteDto,
} from './dto';

@ApiTags('国际化管理')
@Controller('i18n')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class I18nController {
  constructor(private i18nService: I18nService) {}

  /**
   * 获取翻译列表（分页）
   */
  @Get()
  @ApiOperation({
    summary: '获取翻译列表（分页，管理界面用）',
    description: '支持按语言、模块、关键词筛选和搜索',
  })
  async findAll(@Query() query: QueryI18nTranslationDto) {
    return this.i18nService.findAll(query);
  }

  /**
   * 获取指定语言的所有翻译（嵌套格式）
   */
  @Public()
  @Get('nested/:language')
  @ApiOperation({
    summary: '获取指定语言的所有翻译（嵌套格式，i18next兼容）',
    description: '返回嵌套的JSON格式，适合前端加载',
  })
  async getNestedTranslations(
    @Param('language') language: Language,
  ): Promise<Record<string, any>> {
    if (!Object.values(Language).includes(language)) {
      throw new BadRequestException('无效的语言代码');
    }
    return this.i18nService.getNestedTranslations(language);
  }

  /**
   * 获取所有语言的翻译（前端一次性加载）
   */
  @Public()
  @Get('all')
  @ApiOperation({
    summary: '获取所有语言的翻译',
    description: '返回所有支持语言的翻译数据，用于前端启动时一次性加载',
  })
  async getAllTranslations(): Promise<Record<Language, Record<string, any>>> {
    return this.i18nService.getAllTranslations();
  }

  /**
   * 获取所有模块名称
   */
  @Get('modules')
  @ApiOperation({
    summary: '获取所有模块名称',
    description: '用于管理界面的模块筛选器',
  })
  async getModules(): Promise<string[]> {
    return this.i18nService.getModules();
  }

  /**
   * 批量删除翻译
   */
  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除翻译' })
  async batchDelete(@Body() dto: BatchDeleteDto): Promise<{ deleted: number }> {
    const deleted = await this.i18nService.batchDelete(dto.ids);
    return { deleted };
  }

  /**
   * 导入JSON格式翻译
   */
  @Post('import/json')
  @ApiOperation({
    summary: '导入JSON格式翻译',
    description: '支持嵌套JSON格式，自动扁平化存储到数据库',
  })
  async importFromJson(
    @Body() dto: BatchImportDto,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    return this.i18nService.importFromJson(dto);
  }

  /**
   * 导出JSON格式翻译
   */
  @Get('export/json/:language')
  @ApiOperation({
    summary: '导出JSON格式翻译',
    description: '返回指定语言的嵌套JSON格式',
  })
  async exportToJson(
    @Param('language') language: Language,
  ): Promise<Record<string, any>> {
    if (!Object.values(Language).includes(language)) {
      throw new BadRequestException('无效的语言代码');
    }
    return this.i18nService.exportToJson(language);
  }

  /**
   * 获取单个翻译
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单个翻译' })
  async findById(@Param('id') id: string): Promise<I18nTranslation> {
    return this.i18nService.findById(id);
  }

  /**
   * 创建翻译
   */
  @Post()
  @ApiOperation({ summary: '创建翻译' })
  async create(
    @Body() dto: CreateI18nTranslationDto,
  ): Promise<I18nTranslation> {
    return this.i18nService.create(dto);
  }

  /**
   * 更新翻译
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新翻译' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateI18nTranslationDto,
  ): Promise<I18nTranslation> {
    return this.i18nService.update(id, dto);
  }

  /**
   * 删除翻译
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除翻译' })
  async delete(@Param('id') id: string): Promise<null> {
    await this.i18nService.delete(id);
    return null;
  }
}
