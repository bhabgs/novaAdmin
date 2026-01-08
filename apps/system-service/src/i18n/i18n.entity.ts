import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_i18n')
export class I18n extends BaseEntity {
  @Column({ length: 255, unique: true })
  key: string;

  @Column({ name: 'zh_CN', type: 'text', nullable: true })
  zhCN: string;

  @Column({ name: 'en_US', type: 'text', nullable: true })
  enUS: string;

  @Column({ name: 'ar_SA', type: 'text', nullable: true })
  arSA: string;

  @Column({ length: 50, nullable: true })
  module: string;
}
