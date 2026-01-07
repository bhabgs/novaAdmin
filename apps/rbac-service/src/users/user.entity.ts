import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';
import { Role } from '../roles/role.entity';

@Entity('sys_user')
export class User extends BaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'smallint', default: 0 })
  gender: number;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', length: 50, nullable: true })
  lastLoginIp: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];
}
