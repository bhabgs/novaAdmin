import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_dict_type')
export class DictType extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
