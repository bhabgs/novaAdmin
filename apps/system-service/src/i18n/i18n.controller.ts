import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { I18nService } from './i18n.service';

@ApiTags('I18n')
@ApiBearerAuth()
@Controller('i18n')
export class I18nController {
  constructor(private i18nService: I18nService) {}

  @Get()
  @ApiOperation({ summary: 'Get all i18n items' })
  findAll(@Query('locale') locale?: string, @Query('module') module?: string) {
    return this.i18nService.findAll(locale, module);
  }

  @Get('locale/:locale')
  @ApiOperation({ summary: 'Get i18n by locale' })
  findByLocale(@Param('locale') locale: string) {
    return this.i18nService.findByLocale(locale);
  }

  @Post()
  @ApiOperation({ summary: 'Set i18n item' })
  set(@Body() body: { key: string; locale: string; value: string; module?: string }) {
    return this.i18nService.set(body.key, body.locale, body.value, body.module);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch set i18n items' })
  batchSet(@Body() items: { key: string; locale: string; value: string; module?: string }[]) {
    return this.i18nService.batchSet(items);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete i18n item' })
  remove(@Param('id') id: string) {
    return this.i18nService.remove(id);
  }
}
