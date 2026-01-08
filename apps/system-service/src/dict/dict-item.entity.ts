import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_dict_item')
export class DictItem extends BaseEntity {
  @Column({ name: 'dict_type_code', length: 50 })
  dictTypeCode: string;

  @Column({ length: 100 })
  label: string;

  @Column({ length: 100 })
  value: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
