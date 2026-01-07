-- Nova Admin 数据库表结构
-- 运行: psql -U postgres -d nova_admin -f database/migrations/schema.sql

-- 部门表
CREATE TABLE IF NOT EXISTS sys_department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    leader VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    status INTEGER DEFAULT 1,
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 部门树形结构表 (closure-table)
CREATE TABLE IF NOT EXISTS sys_department_closure (
    id_ancestor UUID NOT NULL,
    id_descendant UUID NOT NULL,
    PRIMARY KEY (id_ancestor, id_descendant),
    FOREIGN KEY (id_ancestor) REFERENCES sys_department(id) ON DELETE CASCADE,
    FOREIGN KEY (id_descendant) REFERENCES sys_department(id) ON DELETE CASCADE
);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status INTEGER DEFAULT 1,
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    avatar VARCHAR(255),
    gender INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    department_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (department_id) REFERENCES sys_department(id)
);

-- 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_i18n VARCHAR(255),
    path VARCHAR(255),
    component VARCHAR(255),
    redirect VARCHAR(255),
    icon VARCHAR(255),
    type INTEGER NOT NULL,
    permission VARCHAR(255),
    sort INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    status INTEGER DEFAULT 1,
    is_external BOOLEAN DEFAULT FALSE,
    is_cache BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 菜单树形结构表 (closure-table)
CREATE TABLE IF NOT EXISTS sys_menu_closure (
    id_ancestor UUID NOT NULL,
    id_descendant UUID NOT NULL,
    PRIMARY KEY (id_ancestor, id_descendant),
    FOREIGN KEY (id_ancestor) REFERENCES sys_menu(id) ON DELETE CASCADE,
    FOREIGN KEY (id_descendant) REFERENCES sys_menu(id) ON DELETE CASCADE
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE
);

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id UUID NOT NULL,
    menu_id UUID NOT NULL,
    PRIMARY KEY (role_id, menu_id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES sys_menu(id) ON DELETE CASCADE
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 国际化表
CREATE TABLE IF NOT EXISTS sys_i18n (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    locale VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    module VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(key, locale)
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    username VARCHAR(255),
    module VARCHAR(255),
    action VARCHAR(255),
    method VARCHAR(10),
    url VARCHAR(500),
    ip VARCHAR(50),
    user_agent TEXT,
    request_data TEXT,
    response_data TEXT,
    status INTEGER,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_username ON sys_user(username);
CREATE INDEX IF NOT EXISTS idx_user_department_id ON sys_user(department_id);
CREATE INDEX IF NOT EXISTS idx_role_code ON sys_role(code);
CREATE INDEX IF NOT EXISTS idx_menu_type ON sys_menu(type);
CREATE INDEX IF NOT EXISTS idx_menu_status ON sys_menu(status);
CREATE INDEX IF NOT EXISTS idx_config_key ON sys_config(key);
CREATE INDEX IF NOT EXISTS idx_i18n_key_locale ON sys_i18n(key, locale);
CREATE INDEX IF NOT EXISTS idx_operation_log_user_id ON sys_operation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_log_created_at ON sys_operation_log(created_at);

