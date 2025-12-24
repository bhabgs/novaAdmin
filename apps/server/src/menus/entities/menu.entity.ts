import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MenuType {
  DIRECTORY = 'directory',
  PAGE = 'page',
  BUTTON = 'button',
  IFRAME = 'iframe',
}

export enum MenuStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true, length: 100 })
  i18nKey: string;

  @Column({
    type: 'enum',
    enum: MenuType,
    default: MenuType.PAGE,
  })
  type: MenuType;

  @Column({ nullable: true, length: 36 })
  parentId: string;

  @Column({ nullable: true, length: 50 })
  icon: string;

  @Column({ nullable: true, length: 255 })
  path: string;

  @Column({ nullable: true, length: 255 })
  component: string;

  @Column({ nullable: true, length: 500 })
  externalUrl: string;

  @Column({ default: false })
  openInNewTab: boolean;

  @Column({ nullable: true, length: 100 })
  permission: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({
    type: 'enum',
    enum: MenuStatus,
    default: MenuStatus.ACTIVE,
  })
  status: MenuStatus;

  @Column({ default: false })
  hideInMenu: boolean;

  @Column({ default: true })
  keepAlive: boolean;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ nullable: true, length: 255 })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
