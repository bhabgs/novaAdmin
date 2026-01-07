import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_menu')
@Tree('closure-table')
export class Menu extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ name: 'name_i18n', length: 100, nullable: true })
  nameI18n: string;

  @Column({ length: 255, nullable: true })
  path: string;

  @Column({ length: 255, nullable: true })
  component: string;

  @Column({ length: 255, nullable: true })
  redirect: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ type: 'smallint' })
  type: number; // 1:目录 2:菜单 3:按钮

  @Column({ length: 100, nullable: true })
  permission: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ name: 'is_external', type: 'boolean', default: false })
  isExternal: boolean;

  @Column({ name: 'is_cache', type: 'boolean', default: true })
  isCache: boolean;

  @TreeParent()
  parent: Menu;

  @TreeChildren()
  children: Menu[];
}
