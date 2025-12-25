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
@Index(['language', 'module', 'key'], { unique: true }) // 复合唯一索引
@Index(['language']) // 语言索引，加速按语言查询
@Index(['module']) // 模块索引，加速按模块查询
export class I18nTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Language,
    comment: '语言代码',
  })
  language: Language;

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
    comment: '翻译文本值，支持插值如 {{count}}',
  })
  value: string;

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
