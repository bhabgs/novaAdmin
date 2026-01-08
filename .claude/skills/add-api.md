# 添加新 API

## 后端步骤

1. **创建 DTO**

   - 路径: `apps/{service}/src/{module}/dto/`
   - 定义请求和响应类型

2. **创建 Service**

   - 路径: `apps/{service}/src/{module}/{module}.service.ts`
   - 实现业务逻辑

3. **创建 Controller**

   - 路径: `apps/{service}/src/{module}/{module}.controller.ts`
   - 添加 Swagger 装饰器

4. **注册 Module**
   - 在对应服务的 module 中注册

## 前端步骤

1. **生成 API 客户端**

   ```bash
   pnpm --filter @nova-admin/web openapi
   ```

2. **使用生成的 API**

   ```tsx
   import { xxxApi } from '@/api';

   const data = await xxxApi.getList();
   ```

## 注意事项

- 前端 `src/api/` 目录由 OpenAPI 自动生成，禁止手动修改
- 后端 Controller 必须添加 Swagger 装饰器
- API 路径遵循 RESTful 规范
