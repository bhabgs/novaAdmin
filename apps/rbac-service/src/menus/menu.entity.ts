import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_menu')
@Tree('closure-table')
export class Menu extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'name_i18n', nullable: true })
  nameI18n: string;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  component: string;

  @Column({ nullable: true })
  redirect: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  type: number; // 1:目录 2:菜单 3:按钮

  @Column({ nullable: true })
  permission: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: true })
  visible: boolean;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'is_external', default: false })
  isExternal: boolean;

  @Column({ name: 'is_cache', default: true })
  isCache: boolean;

  @TreeParent()
  parent: Menu;

  @TreeChildren()
  children: Menu[];
}
