-- Nova Admin 数据库表结构

-- 部门表
CREATE TABLE IF NOT EXISTS sys_department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    parent_id UUID,
    leader VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    status SMALLINT DEFAULT 1,
    sort INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 部门闭包表 (用于 TypeORM closure-table 树形结构)
CREATE TABLE IF NOT EXISTS sys_department_closure (
    id_ancestor UUID NOT NULL,
    id_descendant UUID NOT NULL,
    PRIMARY KEY (id_ancestor, id_descendant)
);

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    gender SMALLINT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    department_id UUID,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    status SMALLINT DEFAULT 1,
    sort INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID,
    name VARCHAR(50) NOT NULL,
    name_i18n VARCHAR(100),
    path VARCHAR(255),
    component VARCHAR(255),
    redirect VARCHAR(255),
    icon VARCHAR(50),
    type SMALLINT NOT NULL,
    permission VARCHAR(100),
    sort INT DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    status SMALLINT DEFAULT 1,
    is_external BOOLEAN DEFAULT false,
    is_cache BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 菜单闭包表 (用于 TypeORM closure-table 树形结构)
CREATE TABLE IF NOT EXISTS sys_menu_closure (
    id_ancestor UUID NOT NULL,
    id_descendant UUID NOT NULL,
    PRIMARY KEY (id_ancestor, id_descendant)
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id UUID NOT NULL,
    menu_id UUID NOT NULL,
    PRIMARY KEY (role_id, menu_id)
);

-- 国际化表
CREATE TABLE IF NOT EXISTS sys_i18n (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    zh_CN TEXT,
    en_US TEXT,
    ar_SA TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(20),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    username VARCHAR(50),
    module VARCHAR(50),
    action VARCHAR(50),
    method VARCHAR(10),
    url VARCHAR(255),
    ip VARCHAR(50),
    user_agent VARCHAR(255),
    request_data TEXT,
    response_data TEXT,
    status SMALLINT,
    duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
