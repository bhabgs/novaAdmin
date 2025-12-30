import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchDeleteDto {
  @ApiProperty({ description: 'ID列表' })
  @IsArray()
  ids: string[];
}

