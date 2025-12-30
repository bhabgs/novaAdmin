import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateDto {
  @ApiProperty({ description: '要翻译的文本' })
  @IsString()
  @IsNotEmpty({ message: '文本不能为空' })
  text: string;

  @ApiProperty({ description: '源语言代码', example: 'zh-CN' })
  @IsString()
  @IsNotEmpty({ message: '源语言不能为空' })
  from: string;

  @ApiProperty({ description: '目标语言代码', example: 'en-US' })
  @IsString()
  @IsNotEmpty({ message: '目标语言不能为空' })
  to: string;
}

