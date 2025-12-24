import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RoleStatus } from '../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsString()
  @IsNotEmpty({ message: '角色编码不能为空' })
  code: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '权限列表' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: '状态', enum: RoleStatus })
  @IsOptional()
  @IsEnum(RoleStatus)
  status?: RoleStatus;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class QueryRoleDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class AssignPermissionsDto {
  @ApiProperty({ description: '权限列表' })
  @IsArray()
  permissionIds: string[];
}

export class BatchDeleteDto {
  @ApiProperty({ description: '角色ID列表' })
  @IsArray()
  ids: string[];
}

export class CopyRoleDto {
  @ApiPropertyOptional({ description: '新角色名称' })
  @IsOptional()
  @IsString()
  name?: string;
}
