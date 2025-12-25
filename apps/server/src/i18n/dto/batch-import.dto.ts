import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { Language } from '../entities/i18n-translation.entity';

export class BatchImportDto {
  @ApiProperty({
    enum: Language,
    description: '语言代码',
    example: 'zh-CN',
  })
  @IsEnum(Language, { message: '语言代码必须是有效的枚举值' })
  language: Language;

  @ApiPropertyOptional({
    description: '是否覆盖已存在的翻译',
    default: false,
  })
  @IsBoolean({ message: '覆盖标志必须是布尔值' })
  @IsOptional()
  overwrite?: boolean = false;

  @ApiProperty({
    description: 'JSON格式的翻译数据（嵌套格式）',
    example: {
      common: {
        appName: 'NovaAdmin',
        confirm: '确认',
      },
      user: {
        title: '用户管理',
      },
    },
  })
  @IsObject({ message: '翻译数据必须是对象' })
  data: Record<string, any>;
}
