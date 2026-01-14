import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';
import { Menu } from '../menus/menu.entity';

@Entity('sys_role')
export class Role extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'menu_id' },
  })
  menus: Menu[];
}
