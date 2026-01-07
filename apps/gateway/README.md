# Gateway - API 网关服务

NovaAdmin 微服务架构中的 API 网关，负责路由转发、JWT 验证、限流等功能。

## 功能

- ✅ 路由转发到各个微服务（通过 Nacos 服务发现）
- ✅ JWT Token 验证
- ✅ 限流保护
- ✅ 统一 API 入口
- ✅ CORS 支持
- ✅ Swagger API 文档

## 路由映射

| Gateway 路径          | 目标服务            | 转发路径          |
| --------------------- | ------------------- | ----------------- |
| `/api/auth/*`         | Auth Service (3001) | `/auth/*`         |
| `/api/users/*`        | RBAC Service (3002) | `/users/*`        |
| `/api/roles/*`        | RBAC Service (3002) | `/roles/*`        |
| `/api/menus/*`        | RBAC Service (3002) | `/menus/*`        |
| `/api/i18n/*`         | I18n Service (3003) | `/i18n/*`         |
| `/api/i18n-modules/*` | I18n Service (3003) | `/i18n-modules/*` |

## 环境变量

创建 `.env` 文件：

```env
# 服务配置
PORT=3000
SERVICE_NAME=gateway
SERVICE_IP=localhost

# JWT 配置（必须与 Auth Service 一致）
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h

# Nacos 配置
NACOS_SERVER_ADDR=http://localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

## 启动

```bash
# 开发模式
pnpm dev:gateway

# 或直接进入目录
cd apps/gateway
pnpm dev
```

## API 文档

启动后访问：http://localhost:3000/api-docs

## 认证说明

- 默认所有路由都需要 JWT 认证
- 使用 `@Public()` 装饰器标记公开接口（如登录接口）
- JWT Token 通过 `Authorization: Bearer <token>` 请求头传递

## 限流配置

- 默认限制：每分钟 100 次请求
- 可在 `app.module.ts` 中调整限流配置

## 服务发现

Gateway 通过 Nacos 自动发现后端服务，无需手动配置服务地址。

