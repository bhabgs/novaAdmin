import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty } from 'class-validator';

export class BatchDeleteDto {
  @ApiProperty({
    description: '翻译ID列表',
    type: [String],
    example: ['uuid1', 'uuid2', 'uuid3'],
  })
  @IsArray({ message: 'ids必须是数组' })
  @ArrayNotEmpty({ message: 'ids数组不能为空' })
  ids: string[];
}
