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
import { I18nService } from './i18n.service';
import {
  CreateI18nDto,
  UpdateI18nDto,
  QueryI18nDto,
} from './dto/i18n.dto';
import { TranslateDto } from './dto/translate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { BatchDeleteDto } from '../common/dto/batch-delete.dto';

@ApiTags('多语言管理')
@Controller('i18n')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class I18nController {
  constructor(private i18nService: I18nService) {}

  @Get()
  @ApiOperation({ summary: '获取多语言列表' })
  async findAll(@Query() query: QueryI18nDto) {
    return this.i18nService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取多语言详情' })
  async findOne(@Param('id') id: string) {
    return this.i18nService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建多语言' })
  async create(@Body() dto: CreateI18nDto) {
    return this.i18nService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新多语言' })
  async update(@Param('id') id: string, @Body() dto: UpdateI18nDto) {
    return this.i18nService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除多语言' })
  async delete(@Param('id') id: string) {
    await this.i18nService.delete(id);
    return null;
  }

  @Post('batch')
  @ApiOperation({ summary: '批量删除多语言' })
  async batchDelete(@Body() dto: BatchDeleteDto) {
    await this.i18nService.batchDelete(dto.ids);
    return null;
  }

  @Get('translations/all')
  @Public()
  @ApiOperation({ summary: '获取所有翻译（用于前端i18n初始化）' })
  async getAllTranslations() {
    return this.i18nService.getAllTranslations();
  }

  @Post('translate')
  @Public()
  @ApiOperation({ summary: '翻译文本' })
  async translate(@Body() dto: TranslateDto) {
    const translatedText = await this.i18nService.translateText(
      dto.text,
      dto.from,
      dto.to,
    );
    return { text: translatedText };
  }
}

