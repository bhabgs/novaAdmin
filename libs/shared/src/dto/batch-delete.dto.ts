import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchDeleteDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
