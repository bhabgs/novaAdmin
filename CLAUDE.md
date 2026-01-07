# NovaAdmin 开发指南

## 强制规范

> ⚠️ **必须严格遵守**

1. **禁止修改 `apps/web/src/api/` 目录** - 由 OpenAPI 自动生成，接口变更需运行 `pnpm generate:api`
2. **禁止删除 `apps/web/src/pages/` 下的内容** - 页面组件被动态路由引用，删除会导致路由失效，必要时由用户手动删除
3. **启动服务前检查端口占用** - 避免重复启动

---

## 项目概述

Monorepo 后台管理系统：前端 React 18 + Ant Design 5 | 后端 NestJS + TypeORM + MySQL

```bash
apps/
├── web/src/              # 前端
│   ├── api/              # [禁止修改] OpenAPI 生成
│   ├── components/       # 通用组件 (CrudPage, PageContainer, ErrorBoundary)
│   ├── pages/            # [禁止删除] 业务页面，动态路由引用
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

### 2. CrudPage 组件 + useListManagement Hook

标准 CRUD 列表页模式，提供搜索栏、工具栏、表格、分页、模态框：

```typescript
// 1. 使用 useListManagement 获取通用逻辑
const {
  selectedRowKeys, isModalVisible, editingItem,
  handleSearch, handleAdd, handleEdit, handleDelete, handleBatchDelete, handleRefresh,
  rowSelection, paginationConfig, setIsModalVisible,
} = useListManagement<User>({
  dispatch, fetchAction: fetchUsers, deleteAction: deleteUser,
  loadingSelector: loading, totalSelector: pagination.total,
});

// 2. 使用 CrudPage 组件渲染页面
<CrudPage<User>
  title={t("user.title")}
  dataSource={users}
  columns={columns}
  loading={loading}
  rowSelection={rowSelection}
  selectedRowKeys={selectedRowKeys}
  pagination={paginationConfig}
  onSearch={handleSearch}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBatchDelete={handleBatchDelete}
  onRefresh={handleRefresh}
  filters={[{ key: "status", component: <Select ... /> }]}  // 可选过滤器
  operationColumnRender={(record) => <CustomActions />}     // 可选自定义操作列
/>
```

**CrudPage 主要属性**: `title`, `dataSource`, `columns`, `loading`, `pagination`, `rowSelection`, `onSearch`, `onAdd/Edit/Delete`, `filters`, `modalVisible`, `formContent`

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
2. 菜单管理配置 `{ path, component: "system/Example" }`（component 为 pages/ 下的相对路径）

### 动态路由系统

路由与菜单深度绑定，后台配置菜单即自动生成路由，无需修改前端代码。

**核心文件**: `src/router/` - DynamicRoutes.tsx（核心）、generateRoutes.tsx（生成器）、ProtectedRoute.tsx（守卫）

**菜单类型**:
| 类型 | 用途 | 必填字段 |
|------|------|----------|
| `directory` | 菜单分组，不生成路由 | name, icon |
| `page` | 生成路由和菜单项 | path, component |
| `button` | 仅权限控制 | permission |

**菜单配置示例**:

```json
{
  "type": "page",
  "path": "/reports/sales",
  "component": "Reports/SalesReport",
  "hideInMenu": false
}
```

**带参数路由**: `path: "/users/:id"` → 组件用 `useParams()` 获取

**权限控制**: 用户登录 → 后端返回角色菜单 → 前端生成路由（用户只能访问有权限的页面）

### 国际化

```typescript
const { t } = useTranslation();
// 文件: i18n/locales/{zh-CN,en-US,ar-SA}.json
```

---

## 环境变量

| 前端 (.env)       | 后端 (.env)          |
| ----------------- | -------------------- |
| VITE_APP_TITLE    | DB_HOST/PORT         |
| VITE_API_BASE_URL | DB_USERNAME/PASSWORD |
|                   | DB_DATABASE          |
|                   | JWT_SECRET           |
|                   | PORT (3000)          |

---

## 微服务架构 (feature/microservices-refactor 分支)

### 服务划分

| 服务             | 目录                 | 端口 | 职责                                         |
| ---------------- | -------------------- | ---- | -------------------------------------------- |
| **Gateway**      | `apps/gateway/`      | 3000 | API 网关：路由转发、JWT 验证、限流、统一入口 |
| **Auth Service** | `apps/auth-service/` | 3001 | 认证服务：登录/登出、Token 管理、密码验证    |
| **RBAC Service** | `apps/rbac-service/` | 3002 | 权限服务：用户、角色、菜单管理               |
| **I18n Service** | `apps/i18n-service/` | 3003 | 国际化服务：多语言模块和条目管理             |
| **Web**          | `apps/web/`          | 5173 | 前端应用                                     |

### 目录结构

```bash
apps/
├── gateway/              # API 网关
│   └── src/
│       ├── proxy/        # 服务代理转发
│       ├── guards/       # JWT 认证守卫
│       └── decorators/   # @Public() 等装饰器
├── auth-service/         # 认证服务
│   └── src/
│       ├── auth/         # 登录/Token 逻辑
│       └── strategies/   # JWT 策略
├── rbac-service/         # 权限服务
│   └── src/
│       ├── users/        # 用户模块
│       ├── roles/        # 角色模块
│       └── menus/        # 菜单模块
├── i18n-service/         # 国际化服务
│   └── src/
│       ├── i18n/         # 国际化条目
│       └── i18n-modules/ # 国际化模块
└── web/                  # 前端

libs/
└── shared/               # 共享库
    ├── nacos/            # Nacos 服务注册发现
    ├── guards/           # InternalApiGuard 内部 API 认证
    ├── interceptors/     # TraceInterceptor 链路追踪、TransformInterceptor 响应转换
    ├── dto/              # 共享 DTO (分页、响应格式等)
    └── utils/            # ServiceClient 服务调用工具
```

### 服务通信规则

1. **外部请求**：前端 → Gateway (3000) → 各微服务
2. **服务发现**：Nacos 注册中心（自动注册与发现）
3. **内部通信**：通过 Nacos 服务发现获取地址，使用 HTTP 调用
4. **认证流程**：Gateway 统一验证 JWT，内部服务信任 Gateway 转发的请求

### Nacos 配置

环境变量配置（各服务）：
- `NACOS_SERVER_ADDR`: Nacos 服务器地址（默认: `http://localhost:8848`）
- `NACOS_NAMESPACE`: 命名空间（默认: `public`）
- `NACOS_USERNAME`: 用户名（默认: `nacos`）
- `NACOS_PASSWORD`: 密码（默认: `nacos`）
- `SERVICE_NAME`: 服务名称（如: `auth-service`）
- `SERVICE_IP`: 服务 IP（默认: `localhost`）
- `PORT`: 服务端口

### 路由映射 (Gateway → 微服务)

| Gateway 路径          | 目标服务            | 转发路径          |
| --------------------- | ------------------- | ----------------- |
| `/api/auth/*`         | Auth Service (3001) | `/auth/*`         |
| `/api/users/*`        | RBAC Service (3002) | `/users/*`        |
| `/api/roles/*`        | RBAC Service (3002) | `/roles/*`        |
| `/api/menus/*`        | RBAC Service (3002) | `/menus/*`        |
| `/api/i18n/*`         | I18n Service (3003) | `/i18n/*`         |
| `/api/i18n-modules/*` | I18n Service (3003) | `/i18n-modules/*` |

### 开发规范

1. **共享代码放 `libs/shared/`**：DTO、Guard、Interceptor、工具函数、Nacos 服务
2. **每个服务独立数据库连接**：可共享数据库，但连接独立配置
3. **服务间调用使用 ServiceClient**：通过 Nacos 服务发现自动获取服务地址
4. **环境变量命名规范**：`SERVICE_NAME_` 前缀区分，如 `AUTH_SERVICE_PORT`
5. **日志统一格式**：包含 `traceId`、`serviceName`、`timestamp`
6. **服务自动注册**：服务启动时自动注册到 Nacos，关闭时自动注销

### 启动命令

```bash
pnpm dev:gateway        # 启动网关
pnpm dev:auth           # 启动认证服务
pnpm dev:rbac           # 启动权限服务
pnpm dev:i18n           # 启动国际化服务
pnpm dev:services       # 启动所有后端服务
pnpm dev                # 启动全部 (前端 + 后端服务)
```

### 新增微服务流程

1. 在 `apps/` 下创建新服务目录，使用 `nest new` 或复制模板
2. 配置 `package.json`，设置 `name` 为 `@nova-admin/xxx-service`
3. 在 `pnpm-workspace.yaml` 中确保 `apps/*` 已包含
4. 添加服务到 Gateway 路由映射
5. 配置环境变量和端口
6. 更新根目录 `package.json` 添加启动脚本
