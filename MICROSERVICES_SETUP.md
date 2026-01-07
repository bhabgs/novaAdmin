# 微服务架构部署指南

## 前置要求

1. **Nacos 服务器**：需要先启动 Nacos 服务发现服务器
   ```bash
   # 使用 Docker 启动 Nacos
   docker run -d \
     --name nacos \
     -p 8848:8848 \
     -e MODE=standalone \
     nacos/nacos-server:v2.3.0
   
   # 或下载 Nacos 并启动
   # 访问 http://localhost:8848/nacos
   # 默认账号：nacos / nacos
   ```

2. **MySQL 数据库**：确保数据库已创建并运行

## 环境配置

### 1. 复制环境变量文件

```bash
# Gateway
cp apps/gateway/.env.example apps/gateway/.env

# Auth Service
cp apps/auth-service/.env.example apps/auth-service/.env

# RBAC Service
cp apps/rbac-service/.env.example apps/rbac-service/.env

# I18n Service
cp apps/i18n-service/.env.example apps/i18n-service/.env
```

### 2. 配置环境变量

**重要**：所有服务的 `JWT_SECRET` 必须一致！

编辑各服务的 `.env` 文件，配置：
- 数据库连接信息
- JWT_SECRET（所有服务必须相同）
- Nacos 连接信息

## 启动顺序

### 方式一：逐个启动（推荐用于开发调试）

```bash
# 1. 启动 Nacos（如果还没启动）

# 2. 启动后端服务（按顺序）
pnpm dev:auth      # Auth Service (3001)
pnpm dev:rbac      # RBAC Service (3002)
pnpm dev:i18n      # I18n Service (3003)
pnpm dev:gateway   # Gateway (3000)

# 3. 启动前端
pnpm dev:web       # Web (5173)
```

### 方式二：一键启动所有服务

```bash
# 启动所有后端服务
pnpm dev:services

# 启动全部（前端 + 后端）
pnpm dev
```

## 验证服务

### 1. 检查 Nacos 服务注册

访问 http://localhost:8848/nacos，登录后查看"服务管理" → "服务列表"，应该看到：
- gateway
- auth-service
- rbac-service
- i18n-service

### 2. 检查 Gateway 健康状态

```bash
# 健康检查
curl http://localhost:3000/api/health

# 检查后端服务状态
curl http://localhost:3000/api/health/services
```

### 3. 测试 API

```bash
# 登录（通过 Gateway）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 获取用户信息（需要 Token）
curl http://localhost:3000/api/auth/user-info \
  -H "Authorization: Bearer <token>"
```

## 前端配置

前端已配置为通过 Gateway 访问 API：
- API 地址：`http://localhost:3000/api`
- 可通过环境变量 `VITE_API_BASE_URL` 修改

## 常见问题

### 1. 服务无法注册到 Nacos

- 检查 Nacos 是否启动
- 检查 `NACOS_SERVER_ADDR` 配置是否正确
- 检查网络连接

### 2. Gateway 返回 503 Service not available

- 检查后端服务是否已启动
- 检查 Nacos 中服务是否已注册
- 检查服务名称是否匹配

### 3. JWT 验证失败

- 确保所有服务的 `JWT_SECRET` 配置一致
- 检查 Token 是否正确传递

### 4. 数据库连接失败

- 检查数据库是否运行
- 检查数据库连接配置
- 确保数据库已创建

## 生产环境部署

1. **环境变量**：使用环境变量或配置中心管理敏感信息
2. **数据库**：使用独立的数据库实例，配置连接池
3. **Nacos 集群**：生产环境建议使用 Nacos 集群
4. **负载均衡**：Gateway 前配置负载均衡器
5. **监控**：配置日志和监控系统
6. **安全**：配置 HTTPS、防火墙规则

