import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from '../entities/i18n-translation.entity';

export class QueryI18nTranslationDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 50,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于等于1' })
  pageSize?: number = 50;

  @ApiPropertyOptional({
    enum: Language,
    description: '按语言筛选',
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: '按模块筛选',
    example: 'common',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: '搜索关键词（搜索key或value）',
    example: 'appName',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
