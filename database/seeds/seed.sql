-- Nova Admin 种子数据
-- 运行: psql -U postgres -d nova_admin -f seed.sql

-- 清空现有数据 (如果表存在)
DO $$ 
BEGIN
    TRUNCATE TABLE sys_role_menu, sys_user_role, sys_operation_log, sys_i18n, sys_config, sys_menu, sys_role, sys_user, sys_department CASCADE;
EXCEPTION 
    WHEN undefined_table THEN
        -- 表不存在，跳过清空操作
        NULL;
END $$;

-- 部门数据
INSERT INTO sys_department (id, name, code, leader, phone, email, status, sort, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '总公司', 'HQ', '张总', '13800000001', 'hq@nova.com', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '技术部', 'TECH', '李经理', '13800000002', 'tech@nova.com', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '产品部', 'PRODUCT', '王经理', '13800000003', 'product@nova.com', 1, 2, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', '运营部', 'OPS', '赵经理', '13800000004', 'ops@nova.com', 1, 3, NOW(), NOW());

-- 角色数据
INSERT INTO sys_role (id, name, code, description, status, sort, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', '超级管理员', 'SUPER_ADMIN', '拥有所有权限', 1, 1, NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', '管理员', 'ADMIN', '系统管理员', 1, 2, NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', '普通用户', 'USER', '普通用户权限', 1, 3, NOW(), NOW());

-- 用户数据 (密码: 123456, bcrypt加密)
INSERT INTO sys_user (id, username, password, nickname, email, phone, status, department_id, created_at, updated_at) VALUES
('20000000-0000-0000-0000-000000000001', 'admin', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', '超级管理员', 'admin@nova.com', '13800000000', 1, '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
('20000000-0000-0000-0000-000000000002', 'test', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', '测试用户', 'test@nova.com', '13800000001', 1, '00000000-0000-0000-0000-000000000002', NOW(), NOW());

-- 用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003');

-- 菜单数据
INSERT INTO sys_menu (id, name, name_i18n, path, component, icon, type, permission, sort, visible, status, created_at, updated_at) VALUES
-- 一级菜单
('30000000-0000-0000-0000-000000000001', '仪表盘', 'menu.dashboard', '/dashboard', 'pages/dashboard/index', 'LayoutDashboard', 2, NULL, 1, true, 1, NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', '系统管理', 'menu.system', '/system', NULL, 'Settings', 1, NULL, 2, true, 1, NOW(), NOW()),
-- 系统管理子菜单
('30000000-0000-0000-0000-000000000003', '用户管理', 'menu.user', '/system/user', 'pages/system/user/index', 'Users', 2, 'system:user:list', 1, true, 1, NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', '角色管理', 'menu.role', '/system/role', 'pages/system/role/index', 'Shield', 2, 'system:role:list', 2, true, 1, NOW(), NOW()),
('30000000-0000-0000-0000-000000000005', '部门管理', 'menu.department', '/system/department', 'pages/system/department/index', 'Building2', 2, 'system:department:list', 3, true, 1, NOW(), NOW()),
('30000000-0000-0000-0000-000000000006', '菜单管理', 'menu.menu', '/system/menu', 'pages/system/menu/index', 'Menu', 2, 'system:menu:list', 4, true, 1, NOW(), NOW());

-- 角色菜单关联 (超级管理员拥有所有菜单)
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005'),
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006'),
-- 普通用户只有仪表盘
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001');

-- 系统配置
INSERT INTO sys_config (id, key, value, type, description, created_at, updated_at) VALUES
('40000000-0000-0000-0000-000000000001', 'site.name', 'Nova Admin', 'string', '站点名称', NOW(), NOW()),
('40000000-0000-0000-0000-000000000002', 'site.logo', '/logo.png', 'string', '站点Logo', NOW(), NOW()),
('40000000-0000-0000-0000-000000000003', 'user.defaultPassword', '123456', 'string', '用户默认密码', NOW(), NOW());

-- 国际化数据
INSERT INTO sys_i18n (id, key, locale, value, module, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000001', 'menu.dashboard', 'zh-CN', '仪表盘', 'menu', NOW(), NOW()),
('50000000-0000-0000-0000-000000000002', 'menu.dashboard', 'en-US', 'Dashboard', 'menu', NOW(), NOW()),
('50000000-0000-0000-0000-000000000003', 'menu.system', 'zh-CN', '系统管理', 'menu', NOW(), NOW()),
('50000000-0000-0000-0000-000000000004', 'menu.system', 'en-US', 'System', 'menu', NOW(), NOW());
