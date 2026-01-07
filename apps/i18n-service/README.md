# I18n Service - 国际化服务

NovaAdmin 微服务架构中的国际化服务，负责多语言模块和条目管理。

## 功能

- ✅ 多语言条目管理（CRUD、批量导入）
- ✅ 多语言模块管理（CRUD）
- ✅ 翻译功能
- ✅ 前端 i18n 数据导出

## 环境变量

创建 `.env` 文件：

```env
# 服务配置
PORT=3003
SERVICE_NAME=i18n-service
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
pnpm dev:i18n

# 或直接进入目录
cd apps/i18n-service
pnpm dev
```

## API 文档

启动后访问：http://localhost:3003/api-docs

## 接口列表

### 多语言条目
- `GET /i18n` - 获取多语言列表
- `GET /i18n/:id` - 获取多语言详情
- `POST /i18n` - 创建多语言
- `PUT /i18n/:id` - 更新多语言
- `DELETE /i18n/:id` - 删除多语言
- `POST /i18n/batch` - 批量删除
- `GET /i18n/translations/all` - 获取所有翻译（前端初始化）
- `POST /i18n/translate` - 翻译文本
- `POST /i18n/import` - 批量导入

### 多语言模块
- `GET /i18n-modules` - 获取模块列表
- `GET /i18n-modules/:id` - 获取模块详情
- `POST /i18n-modules` - 创建模块
- `PUT /i18n-modules/:id` - 更新模块
- `DELETE /i18n-modules/:id` - 删除模块
- `POST /i18n-modules/batch` - 批量删除

## 服务注册

服务启动后会自动注册到 Nacos，服务名称为 `i18n-service`。

