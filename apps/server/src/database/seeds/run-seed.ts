import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { seedI18nTranslations } from './i18n-seed';
import { I18nTranslation } from '../../i18n/entities/i18n-translation.entity';

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
  synchronize: true,
});

async function runSeed() {
  console.log('🌱 Starting database seed...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // 创建角色
    const roleRepository = AppDataSource.getRepository('Role');
    const roles = [
      {
        id: 'role-admin',
        name: '超级管理员',
        code: 'admin',
        description: '拥有所有权限',
        permissions: [
          'system:user:list',
          'system:user:create',
          'system:user:update',
          'system:user:delete',
          'system:role:list',
          'system:role:create',
          'system:role:update',
          'system:role:delete',
          'system:menu:list',
          'system:menu:create',
          'system:menu:update',
          'system:menu:delete',
        ],
        status: 'active',
        sortOrder: 1,
      },
      {
        id: 'role-user',
        name: '普通用户',
        code: 'user',
        description: '普通用户权限',
        permissions: ['system:user:list', 'system:role:list', 'system:menu:list'],
        status: 'active',
        sortOrder: 2,
      },
      {
        id: 'role-guest',
        name: '访客',
        code: 'guest',
        description: '只读权限',
        permissions: ['system:user:list'],
        status: 'active',
        sortOrder: 3,
      },
    ];

    for (const role of roles) {
      const existing = await roleRepository.findOne({ where: { code: role.code } });
      if (!existing) {
        await roleRepository.save(role);
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }

    // 创建用户
    const userRepository = AppDataSource.getRepository('User');
    const adminRole = await roleRepository.findOne({ where: { code: 'admin' } });
    const userRole = await roleRepository.findOne({ where: { code: 'user' } });

    const users = [
      {
        id: 'user-admin',
        username: 'admin',
        password: await bcrypt.hash('123456', 10),
        email: 'admin@example.com',
        name: '管理员',
        phone: '13800138000',
        status: 'active',
        roles: [adminRole],
        permissions: [],
      },
      {
        id: 'user-demo',
        username: 'user',
        password: await bcrypt.hash('123456', 10),
        email: 'user@example.com',
        name: '演示用户',
        phone: '13800138001',
        status: 'active',
        roles: [userRole],
        permissions: [],
      },
    ];

    for (const user of users) {
      const existing = await userRepository.findOne({
        where: { username: user.username },
      });
      if (!existing) {
        await userRepository.save(user);
        console.log(`✅ Created user: ${user.username}`);
      } else {
        console.log(`⏭️  User already exists: ${user.username}`);
      }
    }

    // 创建菜单
    const menuRepository = AppDataSource.getRepository('Menu');
    const menus = [
      // 首页
      {
        id: 'menu-home',
        name: '首页',
        i18nKey: 'menu.home',
        type: 'page',
        path: '/home',
        component: 'base/Home',
        icon: 'HomeOutlined',
        sortOrder: 1,
        status: 'active',
      },
      // 仪表盘
      {
        id: 'menu-dashboard',
        name: '仪表盘',
        i18nKey: 'menu.dashboard',
        type: 'page',
        path: '/dashboard',
        component: 'base/Dashboard',
        icon: 'DashboardOutlined',
        sortOrder: 2,
        status: 'active',
      },
      // 系统管理
      {
        id: 'menu-system',
        name: '系统管理',
        i18nKey: 'menu.system',
        type: 'directory',
        path: '/system',
        icon: 'SettingOutlined',
        sortOrder: 10,
        status: 'active',
      },
      {
        id: 'menu-system-user',
        name: '用户管理',
        i18nKey: 'menu.system.user',
        type: 'page',
        parentId: 'menu-system',
        path: '/system/user',
        component: 'system/User',
        icon: 'UserOutlined',
        sortOrder: 1,
        status: 'active',
      },
      {
        id: 'menu-system-role',
        name: '角色管理',
        i18nKey: 'menu.system.role',
        type: 'page',
        parentId: 'menu-system',
        path: '/system/role',
        component: 'system/Role',
        icon: 'TeamOutlined',
        sortOrder: 2,
        status: 'active',
      },
      {
        id: 'menu-system-menu',
        name: '菜单管理',
        i18nKey: 'menu.system.menu',
        type: 'page',
        parentId: 'menu-system',
        path: '/system/menu',
        component: 'system/Menu',
        icon: 'MenuOutlined',
        sortOrder: 3,
        status: 'active',
      },
      {
        id: 'menu-system-icons',
        name: '图标库',
        i18nKey: 'menu.system.icons',
        type: 'page',
        parentId: 'menu-system',
        path: '/system/icons',
        component: 'system/Icons',
        icon: 'AppstoreOutlined',
        sortOrder: 4,
        status: 'active',
      },
    ];

    for (const menu of menus) {
      const existing = await menuRepository.findOne({ where: { id: menu.id } });
      if (!existing) {
        await menuRepository.save(menu);
        console.log(`✅ Created menu: ${menu.name}`);
      } else {
        console.log(`⏭️  Menu already exists: ${menu.name}`);
      }
    }

    // 导入i18n翻译
    const i18nRepository = AppDataSource.getRepository(I18nTranslation);
    await seedI18nTranslations(i18nRepository);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📋 Default accounts:');
    console.log('   Admin: admin / 123456');
    console.log('   User:  user / 123456');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
