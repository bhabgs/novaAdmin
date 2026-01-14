import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigsService } from './configs.service';

@ApiTags('Configs')
@ApiBearerAuth()
@Controller('configs')
export class ConfigsController {
  constructor(private configsService: ConfigsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all configs' })
  findAll() {
    return this.configsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get config by key' })
  findByKey(@Param('key') key: string) {
    return this.configsService.findByKey(key);
  }

  @Post()
  @ApiOperation({ summary: 'Set config' })
  set(@Body() body: { key: string; value: string; type?: string; description?: string }) {
    return this.configsService.set(body.key, body.value, body.type, body.description);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete config' })
  remove(@Param('key') key: string) {
    return this.configsService.remove(key);
  }
}
