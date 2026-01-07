import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MenuType, MenuStatus } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  name: string;

  @ApiPropertyOptional({ description: '国际化Key' })
  @IsOptional()
  @IsString()
  i18nKey?: string;

  @ApiProperty({ description: '菜单类型', enum: MenuType })
  @IsEnum(MenuType)
  type: MenuType;

  @ApiPropertyOptional({ description: '父菜单ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '组件路径' })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiPropertyOptional({ description: '外部链接' })
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiPropertyOptional({ description: '是否在新标签页打开' })
  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '状态', enum: MenuStatus })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiPropertyOptional({ description: '是否隐藏' })
  @IsOptional()
  @IsBoolean()
  hideInMenu?: boolean;

  @ApiPropertyOptional({ description: '是否缓存' })
  @IsOptional()
  @IsBoolean()
  keepAlive?: boolean;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}

export class BatchDeleteDto {
  @ApiProperty({ description: '菜单ID列表' })
  @IsArray()
  ids: string[];
}

export class UpdateSortDto {
  @ApiProperty({ description: '菜单排序数据' })
  @IsArray()
  menus: { id: string; sortOrder: number; parentId?: string }[];
}

export class CopyMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
