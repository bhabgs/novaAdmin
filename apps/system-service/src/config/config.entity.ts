import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_config')
export class Config extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  description: string;
}
