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
  synchronize: false,
});

async function migrateRoleMenuPermission(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('📦 开始角色-菜单权限迁移...');

    // 开始事务
    await queryRunner.startTransaction();

    try {
      // 1. 检查 roles 表是否存在 permissions 列
      const columnsResult = await queryRunner.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'roles' AND COLUMN_NAME = 'permissions'`,
        [process.env.DB_DATABASE || 'nova_admin']
      );

      if (columnsResult.length > 0) {
        // 2. 重命名 permissions 列为 menuIds
        console.log('🔄 将 roles 表的 permissions 列重命名为 menuIds...');
        await queryRunner.query(
          `ALTER TABLE roles CHANGE COLUMN permissions menuIds TEXT NULL COMMENT '菜单ID列表'`
        );
        console.log('✅ roles 表列重命名完成');
      } else {
        // 检查是否已经有 menuIds 列
        const menuIdsResult = await queryRunner.query(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'roles' AND COLUMN_NAME = 'menuIds'`,
          [process.env.DB_DATABASE || 'nova_admin']
        );

        if (menuIdsResult.length === 0) {
          console.log('🆕 添加 menuIds 列到 roles 表...');
          await queryRunner.query(
            `ALTER TABLE roles ADD COLUMN menuIds TEXT NULL COMMENT '菜单ID列表'`
          );
          console.log('✅ menuIds 列添加完成');
        } else {
          console.log('ℹ️ menuIds 列已存在，跳过');
        }
      }

      // 3. 检查 menus 表是否存在 permission 列，如果存在则移除
      const menuColumnsResult = await queryRunner.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menus' AND COLUMN_NAME = 'permission'`,
        [process.env.DB_DATABASE || 'nova_admin']
      );

      if (menuColumnsResult.length > 0) {
        console.log('🗑️ 移除 menus 表的 permission 列...');
        await queryRunner.query(`ALTER TABLE menus DROP COLUMN permission`);
        console.log('✅ menus 表 permission 列移除完成');
      } else {
        console.log('ℹ️ menus 表 permission 列不存在，跳过');
      }

      await queryRunner.commitTransaction();
      console.log('✅ 迁移完成！');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ 迁移失败，回滚中...');
      throw error;
    }

  } catch (error) {
    console.error('❌ 迁移出错:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// 执行迁移
async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ 数据库已连接');

    await migrateRoleMenuPermission(AppDataSource);

    await AppDataSource.destroy();
    console.log('✅ 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

main();

