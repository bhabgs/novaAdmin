import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  menuIds: string[];

  @Column({
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true, length: 255 })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

