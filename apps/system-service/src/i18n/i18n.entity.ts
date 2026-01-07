import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_i18n')
export class I18n extends BaseEntity {
  @Column()
  key: string;

  @Column()
  locale: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  module: string;
}
