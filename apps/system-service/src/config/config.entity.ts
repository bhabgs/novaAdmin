import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_config')
export class Config extends BaseEntity {
  @Column({ length: 100, unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ length: 20, nullable: true })
  type: string;

  @Column({ length: 255, nullable: true })
  description: string;
}
