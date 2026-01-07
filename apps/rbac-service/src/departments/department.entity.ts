import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_department')
@Tree('closure-table')
export class Department extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  leader: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0 })
  sort: number;

  @TreeParent()
  parent: Department;

  @TreeChildren()
  children: Department[];
}
