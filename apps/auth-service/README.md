# Auth Service - 认证服务

NovaAdmin 微服务架构中的认证服务，负责用户登录、Token 管理、密码验证等功能。

## 功能

- ✅ 用户登录/登出
- ✅ JWT Token 生成与刷新
- ✅ 密码修改
- ✅ 用户信息查询
- ✅ Token 验证

## 环境变量

创建 `.env` 文件：

```env
# 服务配置
PORT=3001
SERVICE_NAME=auth-service
SERVICE_IP=localhost

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nova_admin

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# Nacos 配置
NACOS_SERVER_ADDR=http://localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

## 启动

```bash
# 开发模式
pnpm dev:auth

# 或直接进入目录
cd apps/auth-service
pnpm dev
```

## API 文档

启动后访问：http://localhost:3001/api-docs

## 接口列表

- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh-token` - 刷新 Token
- `GET /auth/user-info` - 获取当前用户信息
- `POST /auth/change-password` - 修改密码
- `GET /auth/verify-token` - 验证 Token

## 服务注册

服务启动后会自动注册到 Nacos，服务名称为 `auth-service`。

