import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { I18nModule } from '../../i18n-modules/entities/i18n-module.entity';

@Entity('i18n')
@Index(['moduleId', 'key'], { unique: true })
export class I18n {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  moduleId: string;

  @ManyToOne(() => I18nModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module: I18nModule;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  zhCn: string;

  @Column({ type: 'text' })
  enUs: string;

  @Column({ type: 'text' })
  arSa: string;

  @Column({ nullable: true, length: 255 })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

