import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@nova-admin/shared';

export class CreateI18nModuleDto {
  @ApiProperty({ description: '模块代码', example: 'system' })
  @IsString()
  @IsNotEmpty({ message: '模块代码不能为空' })
  @MaxLength(50, { message: '模块代码长度不能超过50个字符' })
  code: string;

  @ApiProperty({ description: '模块名称', example: '系统管理' })
  @IsString()
  @IsNotEmpty({ message: '模块名称不能为空' })
  @MaxLength(100, { message: '模块名称长度不能超过100个字符' })
  name: string;

  @ApiPropertyOptional({ description: '模块描述' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '备注长度不能超过255个字符' })
  remark?: string;
}

export class UpdateI18nModuleDto {
  @ApiPropertyOptional({ description: '模块名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '模块名称长度不能超过100个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '模块描述' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '备注长度不能超过255个字符' })
  remark?: string;
}

export class QueryI18nModuleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

