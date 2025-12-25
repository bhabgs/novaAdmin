# NovaAdmin 开发指南

## 项目概述

Monorepo 后台管理系统，包含前端（React）和后端（NestJS）。

- **前端**：React 18 + TypeScript + Ant Design 5，支持动态路由、国际化、主题切换
- **后端**：NestJS + TypeORM + MySQL，JWT 认证

## 项目结构

```
NovaAdmin/
├── apps/
│   ├── web/                    # 前端 React 应用
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── server/                 # 后端 NestJS 服务
│       ├── src/
│       │   ├── auth/           # 认证模块
│       │   ├── users/          # 用户模块
│       │   ├── roles/          # 角色模块
│       │   ├── menus/          # 菜单模块
│       │   └── common/         # 公共模块
│       └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## 常用命令

```bash
# 根目录运行
pnpm install          # 安装所有依赖
pnpm dev              # 同时启动前端和后端
pnpm dev:web          # 仅启动前端 (http://localhost:5173)
pnpm dev:server       # 仅启动后端 (http://localhost:3000)
pnpm build            # 构建所有项目
pnpm lint             # ESLint 检查
pnpm check            # TypeScript 类型检查
```

## 前端开发

### 访问地址

- 开发模式：http://localhost:5173
- API 文档：http://localhost:3000/api/docs（需启动后端）
- 启动服务前先查看当前服务是否启动，如果启动了就不需要在启动了，避免启动多个重复服务。

### 技术栈

React 18.3 | TypeScript 5.8 | Vite 6.3 | Ant Design 5.22 | React Router 7.3 | Redux Toolkit 2.5 | Axios 1.7 | i18next 24.2

### 前端目录结构

```
apps/web/src/
├── api/              # API 请求 受保护文件夹，由openapi 生成管理
├── components/       # 通用组件 (CrudPage, PageContainer, CommonTable)
├── pages/            # 业务页面
│   ├── base/         # Dashboard, Home, Login, Profile
│   ├── system/       # User, Role, Menu, Icons, Settings
│   └── tools/        # Utils, MarkdownViewer
├── router/           # 动态路由
├── store/slices/     # Redux 状态管理
├── i18n/locales/     # 语言文件 (zh-CN, en-US, ar-SA)
├── types/            # TypeScript 类型
├── data/             # 本地假数据
└── layouts/          # 布局组件
```

## 后端开发

### 启动后端

```bash
# 1. 配置数据库
cp apps/server/.env.example apps/server/.env
# 编辑 .env 配置 MySQL 连接

# 2. 创建数据库
mysql -u root -p -e "CREATE DATABASE nova_admin"

# 3. 初始化数据
pnpm --filter @nova-admin/server seed

# 4. 启动服务
pnpm dev:server
```

### 默认账号

- 管理员：`admin` / `123456`
- 普通用户：`user` / `123456`

### API 端点

| 模块 | 前缀         | 说明                   |
| ---- | ------------ | ---------------------- |
| 认证 | `/api/auth`  | 登录、登出、Token 刷新 |
| 用户 | `/api/users` | 用户 CRUD、角色分配    |
| 角色 | `/api/roles` | 角色 CRUD、权限管理    |
| 菜单 | `/api/menus` | 菜单 CRUD、树形结构    |

### 后端目录结构

```
apps/server/src/
├── main.ts               # 入口文件
├── app.module.ts         # 根模块
├── auth/                 # 认证模块
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/       # JWT 策略
│   └── guards/           # 认证守卫
├── users/                # 用户模块
│   ├── entities/         # 用户实体
│   ├── dto/              # 数据传输对象
│   ├── users.controller.ts
│   └── users.service.ts
├── roles/                # 角色模块
├── menus/                # 菜单模块
├── common/               # 公共模块
│   ├── decorators/       # 自定义装饰器
│   ├── filters/          # 异常过滤器
│   └── interceptors/     # 响应拦截器
└── database/
    └── seeds/            # 种子数据
```

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
}

interface ListResponse<T> {
  list: T[];
  pagination: { page: number; pageSize: number; total: number };
}
```

## 链接后端 API

- 禁止更改 src/api 目录下的内容，改目录由 openapi 统一生成管理

## 动态路由

### 添加新页面

1. 创建组件：`apps/web/src/pages/system/Example/index.tsx`
2. 菜单管理中配置：

```typescript
{
  name: "示例页面",
  type: "page",
  path: "/example",
  component: "system/Example",
  icon: "AppstoreOutlined",
}
```

## 国际化

支持：zh-CN | en-US | ar-SA (RTL)

```typescript
const { t } = useTranslation();
<h1>{t("example.title")}</h1>;
```

翻译文件：`apps/web/src/i18n/locales/`

## 代码规范

| 类型      | 规范        | 示例           |
| --------- | ----------- | -------------- |
| 组件文件  | PascalCase  | `UserList.tsx` |
| Hook/工具 | camelCase   | `useTheme.ts`  |
| 常量      | UPPER_SNAKE | `API_BASE_URL` |

## 环境变量

### 前端 (apps/web/.env)

| 变量              | 说明     | 默认值                    |
| ----------------- | -------- | ------------------------- |
| VITE_APP_TITLE    | 应用标题 | NovaAdmin                 |
| VITE_API_BASE_URL | API 地址 | http://localhost:3000/api |

### 后端 (apps/server/.env)

| 变量        | 说明       | 默认值     |
| ----------- | ---------- | ---------- |
| DB_HOST     | 数据库主机 | localhost  |
| DB_PORT     | 数据库端口 | 3306       |
| DB_USERNAME | 数据库用户 | root       |
| DB_PASSWORD | 数据库密码 | -          |
| DB_DATABASE | 数据库名   | nova_admin |
| JWT_SECRET  | JWT 密钥   | -          |
| PORT        | 服务端口   | 3000       |

## 常见问题

1. **依赖安装失败**：使用 `pnpm install` 安装
2. **后端连接失败**：检查 MySQL 是否启动，`.env` 配置是否正确
3. **路由不生效**：菜单管理中点击「刷新路由」
4. **类型检查**：`pnpm check`
