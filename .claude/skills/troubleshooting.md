# 常见问题排查

## 前端问题

### 1. 页面白屏 / 路由不工作

**症状：** 访问页面显示空白或 404

**排查步骤：**
1. 检查菜单数据是否正确配置
2. 检查组件路径是否匹配菜单的 component 字段
3. 检查组件是否使用 `export default` 导出
4. 打开浏览器控制台查看错误信息

**解决方案：**
```tsx
// 确保组件正确导出
export default function MyPage() {
  return <div>内容</div>;
}

// 菜单 component 字段应匹配实际路径
// 如: pages/system/user/index.tsx
// component: "system/user"
```

### 2. API 调用失败

**症状：** 请求返回 401/403/500 错误

**排查步骤：**
1. 检查 token 是否过期（localStorage 中的 token）
2. 检查后端服务是否正常运行
3. 检查网关是否正确转发请求
4. 查看浏览器 Network 面板的请求详情

**解决方案：**
```bash
# 检查服务状态
lsof -i :3000  # 网关
lsof -i :5173  # 前端

# 重启服务
pnpm dev:gateway
pnpm dev:web
```

### 3. OpenAPI 生成的 API 不存在

**症状：** 导入的 API 函数报错 "does not provide an export"

**排查步骤：**
1. 检查后端 Controller 是否添加了 Swagger 装饰器
2. 检查网关是否聚合了最新的 Swagger 文档
3. 检查是否运行了 `pnpm generate-api`

**解决方案：**
```bash
# 1. 触发网关重新聚合文档
touch apps/gateway/src/main.ts

# 2. 等待网关重启完成

# 3. 重新生成 API
pnpm generate-api
```

## 后端问题

### 1. 数据库连接失败

**症状：** 服务启动报错 "Connection refused"

**排查步骤：**
1. 检查 Docker 容器是否运行
2. 检查数据库配置是否正确
3. 检查端口是否被占用

**解决方案：**
```bash
# 检查 Docker 状态
docker ps

# 启动数据库
pnpm docker:up

# 初始化数据库
pnpm db:init
```

### 2. 路由冲突

**症状：** 特定路由无法访问，返回错误数据

**原因：** NestJS 路由匹配顺序问题

**解决方案：**
```typescript
// ❌ 错误：通用路由在前
@Get()
findAll() {}

@Get('modules')  // 永远不会被匹配
getModules() {}

// ✅ 正确：具体路由在前
@Get('modules')
getModules() {}

@Get()
findAll() {}
```

### 3. TypeORM 实体未同步

**症状：** 表结构与实体定义不一致

**解决方案：**
```bash
# 开发环境会自动同步（synchronize: true）
# 如果需要手动重建数据库
pnpm db:init
```

## 性能问题

### 1. 页面加载慢

**排查：**
- 检查是否有大量数据未分页
- 检查是否有循环请求
- 使用浏览器 Performance 工具分析

**优化：**
- 添加分页
- 使用虚拟滚动
- 优化 Redux 选择器

### 2. 打包体积大

**排查：**
```bash
# 分析打包体积
pnpm add -D vite-plugin-visualizer
```

**优化：**
- 检查是否引入了不必要的库
- 使用动态导入
- 移除未使用的代码

## 开发环境问题

### 1. 端口冲突

**症状：** 服务启动失败 "Port already in use"

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>
```

### 2. 热重载不工作

**症状：** 修改代码后页面不更新

**解决方案：**
- 检查文件是否保存
- 重启开发服务器
- 清除浏览器缓存
- 检查 Vite 配置

## 调试技巧

### 前端调试

```tsx
// 1. 使用 React DevTools
// 2. 使用 Redux DevTools
// 3. 添加断点调试
debugger;

// 4. 查看网络请求
console.log('API Response:', response);
```

### 后端调试

```typescript
// 1. 使用 NestJS Logger
this.logger.debug('Debug info', data);

// 2. 使用 VSCode 调试器
// 在 launch.json 中配置

// 3. 查看数据库查询
// TypeORM 日志：logging: true
```

## 获取帮助

- 查看浏览器控制台错误
- 查看服务器日志
- 检查 Swagger 文档：http://localhost:3000/api/docs
- 查看项目文档：CLAUDE.md
