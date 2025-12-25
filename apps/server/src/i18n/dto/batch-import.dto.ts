import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsObject } from 'class-validator';

export class BatchImportDto {
  @ApiPropertyOptional({
    description: '是否覆盖已存在的翻译',
    default: false,
  })
  @IsBoolean({ message: '覆盖标志必须是布尔值' })
  @IsOptional()
  overwrite?: boolean = false;

  @ApiProperty({
    description: '按语言分组的JSON格式翻译数据',
    example: {
      'zh-CN': {
        common: {
          appName: 'NovaAdmin',
          confirm: '确认',
        },
      },
      'en-US': {
        common: {
          appName: 'NovaAdmin',
          confirm: 'Confirm',
        },
      },
      'ar-SA': {
        common: {
          appName: 'NovaAdmin',
          confirm: 'تأكيد',
        },
      },
    },
  })
  @IsObject({ message: '翻译数据必须是对象' })
  data: Record<string, Record<string, any>>;
}
