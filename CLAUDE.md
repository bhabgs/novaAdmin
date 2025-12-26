# NovaAdmin 开发指南

## 强制规范

> ⚠️ **必须严格遵守**

1. **禁止修改 `apps/web/src/api/` 目录** - 由 OpenAPI 自动生成，接口变更需运行 `pnpm generate:api`
2. **启动服务前检查端口占用** - 避免重复启动

---

## 项目概述

Monorepo 后台管理系统：前端 React 18 + Ant Design 5 | 后端 NestJS + TypeORM + MySQL

```
apps/
├── web/src/              # 前端
│   ├── api/              # [禁止修改] OpenAPI 生成
│   ├── components/       # 通用组件 (CrudPage, CommonTable, CommonForm)
│   ├── pages/            # 业务页面 (base/, system/, tools/)
│   ├── router/           # 动态路由
│   ├── store/            # Redux (createCrudSlice 工厂)
│   ├── hooks/            # useListManagement 等
│   ├── layouts/          # 主布局
│   ├── i18n/locales/     # 多语言 (zh-CN, en-US, ar-SA)
│   └── utils/            # request.ts, auth.ts
└── server/src/           # 后端
    ├── auth/             # JWT 认证
    ├── users/            # 用户模块
    ├── roles/            # 角色模块
    ├── menus/            # 菜单模块
    ├── i18n/             # 国际化模块
    └── common/           # 装饰器/过滤器/拦截器
```

## 常用命令

```bash
pnpm install              # 安装依赖
pnpm dev                  # 启动前后端 (web:5173, server:3000)
pnpm dev:web              # 仅前端
pnpm dev:server           # 仅后端
pnpm check                # 类型检查
pnpm generate:api         # 重新生成 API 客户端
pnpm --filter @nova-admin/server seed  # 初始化数据库
```

## 默认账号

- 管理员：`admin` / `123456`（受保护）
- 普通用户：`user` / `123456`

---

## 核心模式

### 1. CRUD Slice 工厂

```typescript
// store/slices/userSlice.ts
const { slice, thunks } = createCrudSlice<User>({
  name: 'user',
  api: { findAll, findOne, create, update, delete, batchDelete },
  entityName: '用户',
});
export const fetchUsers = thunks.fetchList;
```

### 2. 列表页 Hook

```typescript
const { handleSearch, handleAdd, handleEdit, handleDelete, rowSelection, paginationConfig } =
  useListManagement<User>({ dispatch, fetchAction, deleteAction, ... });
```

### 3. API 响应格式

```typescript
{ success: boolean, data: T, message: string }
// 分页: data: { list: T[], pagination: { page, pageSize, total } }
```

---

## 开发流程

### 新增接口
1. 后端修改 Controller/DTO → 2. `pnpm generate:api` → 3. 前端使用生成的方法

### 新增页面
1. 创建 `pages/system/Example/index.tsx`
2. 添加到 `router/componentMap.tsx`
3. 菜单管理配置 `{ path, component: "system/Example" }`

### 国际化
```typescript
const { t } = useTranslation();
// 文件: i18n/locales/{zh-CN,en-US,ar-SA}.json
```

---

## 环境变量

| 前端 (.env)       | 后端 (.env)    |
|-------------------|----------------|
| VITE_APP_TITLE    | DB_HOST/PORT   |
| VITE_API_BASE_URL | DB_USERNAME/PASSWORD |
|                   | DB_DATABASE    |
|                   | JWT_SECRET     |
|                   | PORT (3000)    |
