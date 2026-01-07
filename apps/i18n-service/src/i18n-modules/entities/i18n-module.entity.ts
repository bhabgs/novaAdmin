import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { I18n } from '../../i18n/entities/i18n.entity';

@Entity('i18n_modules')
export class I18nModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ nullable: true, length: 255 })
  remark: string;

  @OneToMany(() => I18n, (i18n) => i18n.module)
  i18ns: I18n[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

