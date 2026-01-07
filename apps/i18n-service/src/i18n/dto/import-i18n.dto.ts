import {
  IsArray,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportI18nItemDto {
  @ApiProperty({ description: '模块代码', example: 'common' })
  @IsString()
  @IsNotEmpty({ message: '模块代码不能为空' })
  @MaxLength(50, { message: '模块代码长度不能超过50个字符' })
  module: string;

  @ApiProperty({ description: '键名', example: 'save' })
  @IsString()
  @IsNotEmpty({ message: '键名不能为空' })
  @MaxLength(100, { message: '键名长度不能超过100个字符' })
  key: string;

  @ApiProperty({ description: '中文', example: '保存' })
  @IsString()
  @IsNotEmpty({ message: '中文不能为空' })
  zhCn: string;

  @ApiProperty({ description: '英文', example: 'Save' })
  @IsString()
  @IsNotEmpty({ message: '英文不能为空' })
  enUs: string;

  @ApiProperty({ description: '阿拉伯文', example: 'حفظ' })
  @IsString()
  @IsNotEmpty({ message: '阿拉伯文不能为空' })
  arSa: string;
}

export class ImportI18nModuleDto {
  @ApiProperty({ description: '模块代码', example: 'common' })
  @IsString()
  @IsNotEmpty({ message: '模块代码不能为空' })
  @MaxLength(50, { message: '模块代码长度不能超过50个字符' })
  code: string;

  @ApiProperty({ description: '模块名称', example: '通用' })
  @IsString()
  @IsNotEmpty({ message: '模块名称不能为空' })
  @MaxLength(100, { message: '模块名称长度不能超过100个字符' })
  name: string;

  @ApiPropertyOptional({ description: '模块描述' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;
}

export class ImportI18nDto {
  @ApiPropertyOptional({
    description: '模块列表（如果不存在则创建）',
    type: [ImportI18nModuleDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportI18nModuleDto)
  modules?: ImportI18nModuleDto[];

  @ApiProperty({
    description: '国际化数据列表',
    type: [ImportI18nItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportI18nItemDto)
  items: ImportI18nItemDto[];

  @ApiPropertyOptional({
    description: '是否覆盖已存在的数据',
    default: false,
  })
  @IsOptional()
  overwrite?: boolean;
}

