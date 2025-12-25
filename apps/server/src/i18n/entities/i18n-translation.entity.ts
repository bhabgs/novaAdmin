import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  AR_SA = 'ar-SA',
}

@Entity('i18n_translations')
@Index(['module', 'key'], { unique: true }) // 复合唯一索引
@Index(['module']) // 模块索引，加速按模块查询
export class I18nTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 50,
    comment: '模块名称，如 common, user, role',
  })
  module: string;

  @Column({
    length: 200,
    comment: '翻译键名，如 appName, title, searchPlaceholder',
  })
  key: string;

  @Column({
    type: 'text',
    comment: '中文翻译',
  })
  zhCN: string;

  @Column({
    type: 'text',
    comment: '英文翻译',
  })
  enUS: string;

  @Column({
    type: 'text',
    comment: '阿拉伯语翻译',
  })
  arSA: string;

  @Column({
    nullable: true,
    length: 500,
    comment: '备注说明',
  })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
