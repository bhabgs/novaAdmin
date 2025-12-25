import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nova_admin',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false, // 不自动同步，手动执行迁移
});

interface OldTranslation {
  id: string;
  language: string;
  module: string;
  key: string;
  value: string;
  remark: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewTranslation {
  module: string;
  key: string;
  zhCN: string;
  enUS: string;
  arSA: string;
  remark: string | null;
}

async function restructureI18nTranslations(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('📦 Starting i18n table restructuring...');

    // 1. 读取旧表数据
    console.log('📖 Reading existing translations...');
    const oldTranslations = await queryRunner.query(
      'SELECT * FROM i18n_translations ORDER BY module, `key`, language',
    ) as OldTranslation[];

    console.log(`✅ Found ${oldTranslations.length} translation records`);

    // 2. 按 module + key 分组合并
    console.log('🔄 Grouping translations by module and key...');
    const translationMap = new Map<string, NewTranslation>();

    for (const old of oldTranslations) {
      const mapKey = `${old.module}:${old.key}`;

      if (!translationMap.has(mapKey)) {
        translationMap.set(mapKey, {
          module: old.module,
          key: old.key,
          zhCN: '',
          enUS: '',
          arSA: '',
          remark: old.remark,
        });
      }

      const newRecord = translationMap.get(mapKey)!;

      // 根据语言填充对应字段
      if (old.language === 'zh-CN') {
        newRecord.zhCN = old.value;
      } else if (old.language === 'en-US') {
        newRecord.enUS = old.value;
      } else if (old.language === 'ar-SA') {
        newRecord.arSA = old.value;
      }
    }

    const newTranslations = Array.from(translationMap.values());
    console.log(`✅ Merged into ${newTranslations.length} records`);

    // 3. 开始事务
    await queryRunner.startTransaction();

    try {
      // 4. 备份旧表
      console.log('💾 Backing up old table...');
      await queryRunner.query(
        'CREATE TABLE i18n_translations_backup AS SELECT * FROM i18n_translations',
      );

      // 5. 删除旧表
      console.log('🗑️  Dropping old table...');
      await queryRunner.query('DROP TABLE i18n_translations');

      // 6. 创建新表结构
      console.log('🏗️  Creating new table structure...');
      await queryRunner.query(`
        CREATE TABLE i18n_translations (
          id VARCHAR(36) PRIMARY KEY,
          module VARCHAR(50) NOT NULL COMMENT '模块名称',
          \`key\` VARCHAR(200) NOT NULL COMMENT '翻译键名',
          zhCN TEXT NOT NULL COMMENT '中文翻译',
          enUS TEXT NOT NULL COMMENT '英文翻译',
          arSA TEXT NOT NULL COMMENT '阿拉伯语翻译',
          remark VARCHAR(500) NULL COMMENT '备注说明',
          createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          UNIQUE INDEX idx_module_key (module, \`key\`),
          INDEX idx_module (module)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 7. 插入合并后的数据
      console.log('📥 Inserting merged data...');
      for (const trans of newTranslations) {
        const id = generateUUID();
        await queryRunner.query(
          `INSERT INTO i18n_translations (id, module, \`key\`, zhCN, enUS, arSA, remark)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, trans.module, trans.key, trans.zhCN, trans.enUS, trans.arSA, trans.remark],
        );
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration completed successfully!');
      console.log(`📊 Summary: ${oldTranslations.length} records → ${newTranslations.length} records`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration failed, rolling back...');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// 简单的 UUID 生成函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 执行迁移
async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    await restructureI18nTranslations(AppDataSource);

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
