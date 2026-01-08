# NovaAdmin 开发指南

## 项目概述

NovaAdmin 是一个基于 pnpm + Turbo 的 monorepo 项目，包含 React 前端和 NestJS 微服务后端。

## 项目结构

```
NovaAdmin/
├── apps/
│   ├── web/                # React 前端 (Vite + React 18 + TypeScript)
│   ├── gateway/            # API 网关 (NestJS, 端口 3000)
│   ├── auth-service/       # 认证服务 (NestJS)
│   ├── rbac-service/       # 权限服务 (NestJS)
│   └── system-service/     # 系统服务 (NestJS)
├── libs/shared/            # 共享库 (DTOs, Entities, Decorators)
├── database/               # 数据库脚本
└── docker/                 # Docker 配置
```

## 技术栈

**前端 (apps/web):**
- React 18 + TypeScript + Vite
- Redux Toolkit (状态管理)
- React Router DOM 6 (路由)
- shadcn/ui + Radix UI (组件库)
- Tailwind CSS (样式)
- i18next (国际化)
- React Hook Form + Zod (表单验证)

**后端:**
- NestJS 10 + TypeORM
- PostgreSQL 16 + Redis 7
- JWT + Passport (认证)
- Swagger (API 文档)

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:web          # 仅启动前端 (端口 5173)
pnpm dev:gateway      # 仅启动网关 (端口 3000)

# 基础设施
pnpm docker:up        # 启动 Docker (PostgreSQL, Redis, Nacos)
pnpm docker:down      # 停止 Docker
pnpm db:init          # 初始化数据库

# 构建
pnpm build            # 构建所有包
pnpm generate-api     # 生成 API 客户端代码
```

## 前端目录结构 (apps/web/src)

```
├── api/              # OpenAPI 生成的客户端代码 (勿手动修改)
├── components/
│   └── ui/           # shadcn/ui 组件
├── pages/            # 页面组件
├── store/slices/     # Redux slices
├── layouts/          # 布局组件
├── hooks/            # 自定义 Hooks
├── i18n/locales/     # 国际化文件 (zh-CN, en-US)
└── utils/            # 工具函数
```

## 开发规范

### 强制要求

1. **API 文件禁止手动修改** - `src/api/` 目录由 OpenAPI 自动生成，修改后会被覆盖
2. **优先使用 shadcn/ui 组件** - 不存在的组件先反馈确认，可通过 `npx shadcn@latest add <component>` 添加
3. **路径别名** - 使用 `@/` 代替相对路径，如 `@/components/ui/button`
4. **启动服务前先确认** - 不要随便启动服务，启动前先检查服务是否已运行，避免端口冲突
   - 检查前端: `lsof -i :5173`
   - 检查网关: `lsof -i :3000`
   - 检查 Docker: `docker ps`

### 状态管理

- 使用 Redux Toolkit，slices 位于 `store/slices/`
- 已有 slices: auth, user, role, department, menu, tabs
- 使用 `useAppDispatch` 和 `useAppSelector` hooks

### 路由

- 动态路由从后端菜单数据生成
- 路由生成逻辑在 `utils/dynamicRoutes.ts`
- 认证保护通过 `ProtectedRoute` 组件实现

### 样式

- 使用 Tailwind CSS 工具类
- 主题变量定义在 `index.css` 的 CSS 变量中
- 支持 dark mode (通过 `.dark` class)

### 国际化

- 翻译文件: `i18n/locales/zh-CN.json`, `i18n/locales/en-US.json`
- 使用 `useTranslation` hook: `const { t } = useTranslation()`

## API 交互

```typescript
// 使用 src/api/services.ts 中的 API
import { usersApi, rolesApi, menusApi } from '@/api/services';

// 示例
const response = await usersApi.findAll({ page: 1, pageSize: 10 });
```

## 数据库

- PostgreSQL 连接: `localhost:5432`, 数据库 `nova_admin`, 用户 `postgres`
- 进入数据库: `pnpm psq`
- 初始化: `pnpm db:init`

## 注意事项

- 前端代理配置在 `vite.config.ts`，`/api` 请求代理到 `localhost:3000`
- 后端 Swagger 文档: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`
