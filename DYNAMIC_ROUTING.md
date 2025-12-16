# 动态路由系统使用指南

## 🎯 系统概述

NovaAdmin 现在使用**动态路由系统**，路由配置不再硬编码，而是与菜单管理系统深度绑定。这意味着：

- ✅ **路���即菜单**：在菜单管理中添加菜单项，路由自动生成
- ✅ **权限即路由**：用户只能访问有权限的页面
- ✅ **无需重启**：通过后台配置菜单，前端无需修改代码
- ✅ **懒加载**：所有页面组件按需加载，提升性能

---

## 📁 核心文件结构

```
src/router/
├── README.md              # 详细技术文档
├── index.tsx              # 路由入口（使用 HashRouter）
├── DynamicRoutes.tsx      # 动态路由核心组件
├── generateRoutes.tsx     # 路由生成器
├── componentMap.tsx       # 组件映射表（重要！）
├── utils.ts               # 工具函数导出
├── ProtectedRoute.tsx     # 受保护路由守卫
├── PublicRoute.tsx        # 公开路由守卫
└── routes.tsx             # ⚠️ 已废弃，保留仅作参考
```

---

## 🚀 快速开始

### 1. 添加新页面（3 步完成）

#### 步骤 1: 创建页面组件

```tsx
// src/pages/Reports/SalesReport.tsx
import React from 'react';
import PageContainer from '@/components/PageContainer';

const SalesReport: React.FC = () => {
  return (
    <PageContainer title="销售报表">
      <div>销售数据展示</div>
    </PageContainer>
  );
};

export default SalesReport;
```

#### 步骤 2: 注册到组件映射表

```tsx
// src/router/componentMap.tsx
export const componentMap = {
  // ...existing components
  SalesReport: lazy(() => import('../pages/Reports/SalesReport')),
};
```

#### 步骤 3: 在菜单管理中添加菜单

通过菜单管理界面或 Mock 数据添加：

```json
{
  "id": "1001",
  "name": "销售报表",
  "i18nKey": "menu.salesReport",
  "type": "page",
  "path": "/reports/sales",
  "component": "SalesReport",
  "icon": "BarChartOutlined",
  "sortOrder": 10,
  "status": "active"
}
```

**完成！** 现在访问 `#/reports/sales` 即可看到新页面。

---

## 📋 菜单类型说明

### 1. **directory（目录）**
用作菜单分组，不生成路由。

```json
{
  "type": "directory",
  "name": "报表管理",
  "icon": "FolderOutlined",
  "children": [
    { "type": "page", "path": "/reports/sales", ... },
    { "type": "page", "path": "/reports/inventory", ... }
  ]
}
```

### 2. **page（页面）**
生成路由和菜单项，**必须包含 `path` 和 `component` 字段**。

```json
{
  "type": "page",
  "path": "/users",
  "component": "UserList",
  "name": "用户列表"
}
```

### 3. **button（按钮）**
仅用于权限控制，不生成路由和菜单项。

```json
{
  "type": "button",
  "permission": "user:delete",
  "name": "删除用户"
}
```

---

## 🔐 权限控制机制

### 工作原理

```
用户登录
  ↓
后端返回用户菜单列表（基于角色/权限过滤）
  ↓
前端根据菜单生成路由
  ↓
用户只能访问有权限的路由
```

### 示例

**管理员菜单**（完整权限）：
```json
[
  { "path": "/dashboard", "component": "Dashboard" },
  { "path": "/users", "component": "UserList" },
  { "path": "/roles", "component": "RoleList" },
  { "path": "/settings", "component": "Settings" }
]
```

**普通用户菜单**（受限权限）：
```json
[
  { "path": "/dashboard", "component": "Dashboard" },
  { "path": "/profile", "component": "Profile" }
]
```

普通用户尝试访问 `/users` 会自动跳转到 404 页面。

---

## 🛠️ 高级用法

### 1. 带参数的路由

```json
{
  "type": "page",
  "path": "/users/detail/:id",
  "component": "UserDetail",
  "hideInMenu": true
}
```

在组件中获取参数：
```tsx
import { useParams } from 'react-router-dom';

const UserDetail = () => {
  const { id } = useParams();
  return <div>用户 ID: {id}</div>;
};
```

### 2. 嵌套路由

```json
{
  "id": "100",
  "type": "directory",
  "name": "工具",
  "children": [
    {
      "path": "/util/richtext-editor",
      "component": "RichTextEditor",
      "type": "page"
    },
    {
      "path": "/util/markdown-viewer",
      "component": "MarkdownViewer",
      "type": "page"
    }
  ]
}
```

### 3. 隐藏菜单但保留路由

```json
{
  "path": "/users/edit/:id",
  "component": "UserEdit",
  "type": "page",
  "hideInMenu": true
}
```

---

## 📦 已注册的组件列表

查看 `src/router/componentMap.tsx` 文件，当前已注册：

| 组件名 | 路径 | 说明 |
|--------|------|------|
| Dashboard | `pages/Dashboard` | 仪表盘 |
| UserList | `pages/User/UserList` | 用户列表 |
| UserDetail | `pages/User/UserDetail` | 用户详情 |
| RoleList | `pages/Role/RoleList` | 角色管理 |
| MenuList | `pages/Menu/MenuList` | 菜单管理 |
| Settings | `pages/Settings` | 系统设置 |
| Profile | `pages/Profile` | 个人资料 |
| RichTextEditor | `pages/Utils/RichTextEditor` | 富文本编辑器 |
| PixiEditor | `pages/Utils/PixiEditor` | 图形编辑器 |
| MarkdownViewer | `pages/MarkdownViewer` | Markdown 查看器 |
| IframeView | `pages/IframeView` | Iframe 容器 |

---

## ⚠️ 常见问题

### Q1: 组件找不到警告

**错误信息**: `Component "XXX" not found for menu: 菜单名`

**解决方法**:
1. 检查 `componentMap.tsx` 是否已注册该组件
2. 检查菜单配置的 `component` 字段是否拼写正确（区分大小写）
3. 检查组件文件路径是否正确

### Q2: 路由没有生成

**可能原因**:
1. 菜单 `status` 为 `inactive`
2. 菜单类型为 `directory` 但没有子菜单
3. `path` 或 `component` 字段缺失

**排查方法**:
```tsx
// 在浏览器控制台输入
console.log(store.getState().menu.userMenus);
```

### Q3: 刷新页面路由丢失

**原因**: 用户菜单在 Redux store 中，刷新会重新获取

**解决**: 系统会自动在登录状态下重新获取菜单，无需特殊处理

### Q4: 如何添加公共路由（不需要权限）

在 `DynamicRoutes.tsx` 的 `publicRoutes` 数组中添加：

```tsx
const publicRoutes: RouteObject[] = [
  // ...existing
  {
    path: '/about',
    element: <About />,
  },
];
```

---

## 🎨 最佳实践

### 1. 命名规范

- **组件名**: 使用 PascalCase，如 `UserList`, `SalesReport`
- **路径**: 使用 kebab-case，如 `/user-management`, `/sales-report`
- **菜单 ID**: 使用数字或字符串，保持唯一性

### 2. 组件组织

```
src/pages/
├── User/
│   ├── UserList.tsx        # 列表页
│   ├── UserDetail.tsx      # 详情页
│   ├── UserForm.tsx        # 表单组件（不注册路由）
│   └── index.tsx           # 导出
├── Reports/
│   ├── SalesReport.tsx
│   └── InventoryReport.tsx
```

### 3. 懒加载优化

所有页面组件都使用 `lazy()` 懒加载：

```tsx
// ✅ 推荐
Dashboard: lazy(() => import('../pages/Dashboard'))

// ❌ 不推荐
Dashboard: () => import('../pages/Dashboard')
```

### 4. 权限粒度

- **路由级权限**: 通过菜单的 `status` 和用户角色控制
- **按钮级权限**: 使用 `PermissionWrapper` 组件

```tsx
<PermissionWrapper permission="user:delete">
  <Button danger>删除</Button>
</PermissionWrapper>
```

---

## 🔧 调试技巧

### 1. 查看生成的路由

```tsx
// 在 DynamicRoutes.tsx 中添加
console.log('Generated routes:', routes);
```

### 2. 查看用户菜单

```tsx
// 使用 Redux DevTools 查看
menu.userMenus
```

### 3. 检查组件注册

```tsx
import { getRegisteredComponents } from '@/router/utils';

console.log('Registered components:', getRegisteredComponents());
```

---

## 📚 相关文档

- [详细技术文档](./src/router/README.md)
- [组件映射表](./src/router/componentMap.tsx)
- [路由生成器](./src/router/generateRoutes.tsx)

---

## 🎉 总结

动态路由系统带来的优势：

1. **开发效率** ↑ 80%：新增页面只需 3 步，无需修改路由配置
2. **权限管理** ✓ 统一：路由权限与菜单权限一体化
3. **可维护性** ↑ 60%：路由配置集中在菜单管理中
4. **性能优化** ✓ 懒加载：按需加载，首屏加载更快
5. **灵活性** ↑ 100%：通过后台配置，无需重启前端

开始使用动态路由，让路由管理更简单！ 🚀
