# RBAC Service - 权限服务

NovaAdmin 微服务架构中的权限服务，负责用户、角色、菜单管理。

## 功能

- ✅ 用户管理（CRUD、角色分配、状态管理）
- ✅ 角色管理（CRUD、菜单权限分配）
- ✅ 菜单管理（CRUD、树形结构、排序）

## 环境变量

创建 `.env` 文件：

```env
# 服务配置
PORT=3002
SERVICE_NAME=rbac-service
SERVICE_IP=localhost

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nova_admin

# Nacos 配置
NACOS_SERVER_ADDR=http://localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

## 启动

```bash
# 开发模式
pnpm dev:rbac

# 或直接进入目录
cd apps/rbac-service
pnpm dev
```

## API 文档

启动后访问：http://localhost:3002/api-docs

## 接口列表

### 用户管理
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户
- `POST /users/batch` - 批量删除用户
- `POST /users/:id/reset-password` - 重置密码
- `PATCH /users/:id/status` - 更新状态
- `POST /users/:id/roles` - 分配角色
- `GET /users/:id/permissions` - 获取权限

### 角色管理
- `GET /roles` - 获取角色列表
- `GET /roles/all` - 获取所有角色
- `GET /roles/:id` - 获取角色详情
- `POST /roles` - 创建角色
- `PUT /roles/:id` - 更新角色
- `DELETE /roles/:id` - 删除角色
- `POST /roles/:id/menus` - 分配菜单权限
- `GET /roles/:id/menus` - 获取角色菜单
- `POST /roles/:id/copy` - 复制角色

### 菜单管理
- `GET /menus` - 获取菜单列表
- `GET /menus/tree` - 获取菜单树
- `GET /menus/:id` - 获取菜单详情
- `POST /menus` - 创建菜单
- `PUT /menus/:id` - 更新菜单
- `DELETE /menus/:id` - 删除菜单
- `PUT /menus/sort` - 更新排序
- `POST /menus/:id/copy` - 复制菜单

## 服务注册

服务启动后会自动注册到 Nacos，服务名称为 `rbac-service`。

