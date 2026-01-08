import { IsString, IsOptional, IsInt, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameI18n?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('all')
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  component?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty()
  @IsInt()
  type: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  status?: number;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
