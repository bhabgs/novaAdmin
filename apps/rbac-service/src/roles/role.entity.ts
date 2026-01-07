import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';
import { Menu } from '../menus/menu.entity';

@Entity('sys_role')
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0 })
  sort: number;

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'menu_id' },
  })
  menus: Menu[];
}
