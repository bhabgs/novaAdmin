import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';

@ApiTags('Dict')
@ApiBearerAuth()
@Controller('dict')
export class DictController {
  constructor(private dictService: DictService) {}

  // ========== 字典类型接口 ==========
  @Get('types')
  @ApiOperation({ summary: 'Get all dict types' })
  findAllTypes() {
    return this.dictService.findAllTypes();
  }

  @Get('types/:code')
  @ApiOperation({ summary: 'Get dict type by code' })
  findTypeByCode(@Param('code') code: string) {
    return this.dictService.findTypeByCode(code);
  }

  @Post('types')
  @ApiOperation({ summary: 'Create dict type' })
  createType(@Body() body: any) {
    return this.dictService.createType(body);
  }

  @Put('types/:id')
  @ApiOperation({ summary: 'Update dict type' })
  updateType(@Param('id') id: string, @Body() body: any) {
    return this.dictService.updateType(id, body);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete dict type' })
  removeType(@Param('id') id: string) {
    return this.dictService.removeType(id);
  }

  // ========== 字典项接口 ==========
  @Get('items')
  @ApiOperation({ summary: 'Get dict items by type code' })
  findItemsByTypeCode(@Query('dictTypeCode') dictTypeCode: string) {
    if (dictTypeCode) {
      return this.dictService.findItemsByTypeCode(dictTypeCode);
    }
    return this.dictService.findAllItems();
  }

  @Post('items')
  @ApiOperation({ summary: 'Create dict item' })
  createItem(@Body() body: any) {
    return this.dictService.createItem(body);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update dict item' })
  updateItem(@Param('id') id: string, @Body() body: any) {
    return this.dictService.updateItem(id, body);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete dict item' })
  removeItem(@Param('id') id: string) {
    return this.dictService.removeItem(id);
  }

  @Delete('items/batch')
  @ApiOperation({ summary: 'Batch delete dict items' })
  batchRemoveItems(@Body() body: { ids: string[] }) {
    return this.dictService.batchRemoveItems(body.ids);
  }
}
