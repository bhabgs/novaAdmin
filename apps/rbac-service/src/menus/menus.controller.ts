import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('Menus')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Get menus tree' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by id' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
