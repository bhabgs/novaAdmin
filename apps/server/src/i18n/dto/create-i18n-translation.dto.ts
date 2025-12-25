import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateI18nTranslationDto {
  @ApiProperty({
    description: '模块名称',
    example: 'common',
    maxLength: 50,
  })
  @IsString({ message: '模块名称必须是字符串' })
  @IsNotEmpty({ message: '模块名称不能为空' })
  @MaxLength(50, { message: '模块名称长度不能超过50个字符' })
  module: string;

  @ApiProperty({
    description: '翻译键名',
    example: 'appName',
    maxLength: 200,
  })
  @IsString({ message: '翻译键名必须是字符串' })
  @IsNotEmpty({ message: '翻译键名不能为空' })
  @MaxLength(200, { message: '翻译键名长度不能超过200个字符' })
  key: string;

  @ApiProperty({
    description: '中文翻译',
    example: 'NovaAdmin - 通用后台管理系统',
  })
  @IsString({ message: '中文翻译必须是字符串' })
  @IsNotEmpty({ message: '中文翻译不能为空' })
  zhCN: string;

  @ApiProperty({
    description: '英文翻译',
    example: 'NovaAdmin - Admin Management System',
  })
  @IsString({ message: '英文翻译必须是字符串' })
  @IsNotEmpty({ message: '英文翻译不能为空' })
  enUS: string;

  @ApiProperty({
    description: '阿拉伯语翻译',
    example: 'NovaAdmin - نظام إدارة',
  })
  @IsString({ message: '阿拉伯语翻译必须是字符串' })
  @IsNotEmpty({ message: '阿拉伯语翻译不能为空' })
  arSA: string;

  @ApiPropertyOptional({
    description: '备注说明',
    example: '应用名称',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '备注说明必须是字符串' })
  @MaxLength(500, { message: '备注说明长度不能超过500个字符' })
  remark?: string;
}
