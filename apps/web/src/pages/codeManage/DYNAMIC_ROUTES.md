# 动态路由参数支持

## 问题描述

之前菜单管理在设置页面路径时，无法正确处理带参数的动态路由（如 `/user/:id`）。

## 修复内容

### 1. 安装依赖

```bash
pnpm add path-to-regexp
```

### 2. 更新 PageTabs 组件

在 `src/components/PageTabs/index.tsx` 中：

- 导入 `path-to-regexp` 的 `match` 函数
- 更新 `findMenuByPath` 函数，支持动态路由匹配

### 3. 工作原理

**修复前：**
```typescript
// 只支持精确匹配
if (menu.path === path) {
  return menu;
}
```

**修复后：**
```typescript
// 1. 先尝试精确匹配
if (menu.path === path) {
  return menu;
}

// 2. 检测到动态路由参数，使用 path-to-regexp 匹配
if (menu.path && menu.path.includes(':')) {
  const matchFn = match(menu.path, { decode: decodeURIComponent });
  const result = matchFn(path);
  if (result) {
    return menu;
  }
}
```

## 使用示例

### 菜单配置示例

在菜单管理中配置：

| 字段 | 值 |
|------|------|
| 菜单名称 | 用户详情 |
| 菜单类型 | 页面 |
| 路径 | `/user/:id` |
| 组件 | `system/User/UserDetail` |

### 路由匹配示例

| 菜单路径 | 实际访问路径 | 匹配结果 |
|---------|------------|---------|
| `/user/:id` | `/user/123` | ✅ 匹配成功 |
| `/user/:id` | `/user/456` | ✅ 匹配成功 |
| `/post/:id/edit` | `/post/789/edit` | ✅ 匹配成功 |
| `/user/:id` | `/admin/123` | ❌ 不匹配 |

### 标签页行为

- 访问 `/user/123` → 创建标签页 "用户详情"
- 访问 `/user/456` → 创建新标签页 "用户详情"
- 再次访问 `/user/123` → 激活已存在的标签页

**说明**：不同的参数值会创建不同的标签页，这样用户可以同时查看多个资源。

## 支持的路由参数格式

根据 `path-to-regexp` 库，支持以下格式：

### 1. 基本参数
```
/user/:id
/post/:postId
```

### 2. 多个参数
```
/post/:id/comment/:commentId
/user/:userId/order/:orderId
```

### 3. 可选参数
```
/user/:id?
/post/:category/:id?
```

### 4. 通配符
```
/files/*
/docs/:path*
```

## 注意事项

1. **菜单路径验证**：MenuForm 中的路径验证只要求以 `/` 开头，已支持动态参数
2. **查询参数**：`?param=value` 形式的查询参数会自动保留在标签页中
3. **错误处理**：如果路径格式不正确，会在控制台输出警告并继续查找其他菜单

## 测试建议

1. 创建一个带参数的菜单（如 `/user/:id`）
2. 创建对应的页面组件
3. 访问 `/user/123` 和 `/user/456`
4. 验证：
   - 两个路径都能正确匹配到菜单
   - 创建了两个不同的标签页
   - 标签页标题正确显示
   - 切换标签页工作正常
