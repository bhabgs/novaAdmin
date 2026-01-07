# Nova Admin v2

开箱即用的后台管理平台，基于 React + NestJS 微服务架构。

## 技术栈

### 前端
- React 18 + TypeScript + Vite
- shadcn/ui + Tailwind CSS
- Redux Toolkit
- React Router 6
- i18next

### 后端
- NestJS 10 微服务架构
- TypeORM + PostgreSQL
- JWT 认证
- Swagger API 文档

## 项目结构

```
nova-admin/
├── apps/
│   ├── web/                # 前端应用
│   ├── gateway/            # API网关 (:3000)
│   ├── auth-service/       # 认证服务 (:3001)
│   ├── rbac-service/       # 权限管理服务 (:3002)
│   └── system-service/     # 系统管理服务 (:3003)
├── libs/
│   └── shared/             # 共享库
├── database/
│   └── seeds/              # 种子数据
└── docker/
    └── docker-compose.yml  # Docker配置
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动基础服务

```bash
pnpm docker:up
```

### 3. 初始化数据库

```bash
# 方式1: 一键初始化（创建表结构 + 初始化数据，推荐）
pnpm db:init

# 方式2: 分步执行
# 2.1 创建表结构
pnpm db:schema
# 2.2 初始化数据
pnpm db:seed

# 方式3: 使用 docker exec
docker exec -i nova-postgres psql -U postgres -d nova_admin < database/migrations/schema.sql
docker exec -i nova-postgres psql -U postgres -d nova_admin < database/seeds/seed.sql
```

### 4. 启动开发服务

```bash
# 启动所有服务
pnpm dev

# 或单独启动
pnpm dev:gateway
pnpm dev:auth
pnpm dev:rbac
pnpm dev:system
pnpm dev:web
```

### 5. 访问应用

- 前端: http://localhost:5173
- API网关: http://localhost:3000
- Swagger文档: http://localhost:3000/api/docs

### 默认账号

- 用户名: admin
- 密码: 123456

## 功能模块

- [x] 用户管理
- [x] 角色管理
- [x] 部门管理
- [x] 菜单管理
- [x] 系统配置
- [x] 国际化管理
- [x] 操作日志

## License

MIT
