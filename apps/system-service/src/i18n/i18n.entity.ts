import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_i18n')
@Unique(['key', 'locale'])
export class I18n extends BaseEntity {
  @Column({ length: 255 })
  key: string;

  @Column({ length: 10 })
  locale: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ length: 50, nullable: true })
  module: string;
}
