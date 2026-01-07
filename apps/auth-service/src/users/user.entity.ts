import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';

@Entity('sys_user')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  gender: number;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;
}
