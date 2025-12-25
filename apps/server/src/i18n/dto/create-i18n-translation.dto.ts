import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Language } from '../entities/i18n-translation.entity';

export class CreateI18nTranslationDto {
  @ApiProperty({
    enum: Language,
    description: '语言代码',
    example: 'zh-CN',
  })
  @IsEnum(Language, { message: '语言代码必须是有效的枚举值' })
  language: Language;

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
    description: '翻译文本值，支持插值如 {{count}}',
    example: 'NovaAdmin - 通用后台管理系统',
  })
  @IsString({ message: '翻译文本值必须是字符串' })
  @IsNotEmpty({ message: '翻译文本值不能为空' })
  value: string;

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
