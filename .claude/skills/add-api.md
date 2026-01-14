# 添加新 API

## 后端步骤

1. **创建 DTO**

   - 路径: `apps/{service}/src/{module}/dto/`
   - 定义请求和响应类型
   - 使用 class-validator 装饰器进行验证

2. **创建 Service**

   - 路径: `apps/{service}/src/{module}/{module}.service.ts`
   - 实现业务逻辑

3. **创建 Controller**

   - 路径: `apps/{service}/src/{module}/{module}.controller.ts`
   - 添加 Swagger 装饰器（@ApiTags, @ApiOperation, @ApiBearerAuth）
   - **路由顺序很重要**：更具体的路由必须放在更通用的路由之前
     - 正确：`@Get('modules')` 在 `@Get()` 之前
     - 错误：`@Get()` 在 `@Get('modules')` 之前

4. **注册 Module**
   - 在对应服务的 module 中注册

## 前端步骤

### 1. 等待后端服务更新

- 确保后端服务已重载或重启
- 触发网关重新聚合 Swagger 文档：`touch apps/gateway/src/main.ts`

### 2. 生成 API 客户端

```bash
pnpm generate-api
```

这会从网关的 Swagger 文档生成类型安全的 API 客户端代码到 `apps/web/src/api/`

### 3. 使用生成的 API

**查询列表：**

```tsx
import { xxxControllerFindAll } from '@/api/services.gen';

const response = await xxxControllerFindAll({ query: { page: 1, pageSize: 10 } });
const data = response.data?.data || response.data;
```

**创建：**

```tsx
import { xxxControllerCreate } from '@/api/services.gen';

const response = await xxxControllerCreate({
  body: { name: '测试', code: 'test' },
});
const data = response.data?.data || response.data;
```

**更新：**

```tsx
import { xxxControllerUpdate } from '@/api/services.gen';

const response = await xxxControllerUpdate({
  path: { id: '123' },
  body: { name: '更新' },
});
const data = response.data?.data || response.data;
```

**删除：**

```tsx
import { xxxControllerRemove } from '@/api/services.gen';

await xxxControllerRemove({ path: { id: '123' } });
```

## API 调用格式说明

OpenAPI 生成的 API 使用统一的参数格式：

- `query` - URL 查询参数
- `path` - URL 路径参数（如 `:id`）
- `body` - 请求体数据
- `headers` - 请求头（可选）

## 注意事项

- **禁止手动修改** `apps/web/src/api/` 目录下的任何自动生成文件（带 `.gen.ts` 后缀）
- 后端 Controller 必须添加完整的 Swagger 装饰器，否则不会生成前端 API
- API 路径遵循 RESTful 规范
- 响应数据统一使用 `response.data?.data || response.data` 处理
- 网关在启动时聚合所有微服务的 Swagger 文档，修改后需要触发重新聚合
