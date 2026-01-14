import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_department')
@Tree('closure-table')
export class Department extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ length: 50, nullable: true })
  leader: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @TreeParent()
  parent: Department;

  @TreeChildren()
  children: Department[];
}
