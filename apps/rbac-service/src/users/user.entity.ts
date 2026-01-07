import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@nova-admin/shared';
import { Role } from '../roles/role.entity';

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

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];
}
