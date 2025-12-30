import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateI18nDto {
  @ApiProperty({ description: '模块ID' })
  @IsString()
  @IsNotEmpty({ message: '模块ID不能为空' })
  moduleId: string;

  @ApiProperty({ description: '键名', example: 'user.name' })
  @IsString()
  @IsNotEmpty({ message: '键名不能为空' })
  @MaxLength(100, { message: '键名长度不能超过100个字符' })
  key: string;

  @ApiProperty({ description: '中文', example: '姓名' })
  @IsString()
  @IsNotEmpty({ message: '中文不能为空' })
  zhCn: string;

  @ApiProperty({ description: '英文', example: 'Name' })
  @IsString()
  @IsNotEmpty({ message: '英文不能为空' })
  enUs: string;

  @ApiProperty({ description: '阿拉伯文', example: 'الاسم' })
  @IsString()
  @IsNotEmpty({ message: '阿拉伯文不能为空' })
  arSa: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '备注长度不能超过255个字符' })
  remark?: string;
}

export class UpdateI18nDto {
  @ApiPropertyOptional({ description: '键名' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '键名长度不能超过100个字符' })
  key?: string;

  @ApiPropertyOptional({ description: '中文' })
  @IsOptional()
  @IsString()
  zhCn?: string;

  @ApiPropertyOptional({ description: '英文' })
  @IsOptional()
  @IsString()
  enUs?: string;

  @ApiPropertyOptional({ description: '阿拉伯文' })
  @IsOptional()
  @IsString()
  arSa?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '备注长度不能超过255个字符' })
  remark?: string;
}

export class QueryI18nDto extends PaginationDto {
  @ApiPropertyOptional({ description: '模块ID' })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

