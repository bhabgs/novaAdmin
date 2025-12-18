# 动态路由系统

## 概述

NovaAdmin 使用动态路由系统，路由配置与菜单管理深度绑定：

- **路由即菜单** - 在菜单管理中添加菜单项，路由自动生成
- **权限即路由** - 用户只能访问有权限的页面
- **无需重启** - 通过后台配置菜单，前端无需修改代码
- **懒加载** - 所有页面组件按需加载

## 核心文件

```
src/router/
├── index.tsx              # 路由入口（HashRouter）
├── DynamicRoutes.tsx      # 动态路由核心组件
├── generateRoutes.tsx     # 路由生成器
├── componentMap.tsx       # 组件映射表
├── ProtectedRoute.tsx     # 受保护路由守卫
└── PublicRoute.tsx        # 公开路由守卫
```

## 快速开始：添加新页面

### 步骤 1：创建页面组件

```tsx
// src/pages/Reports/SalesReport.tsx
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

### 步骤 2：在菜单管理中配置

在菜单管理界面或 Mock 数据中添加：

```json
{
  "id": "1001",
  "name": "销售报表",
  "i18nKey": "menu.salesReport",
  "type": "page",
  "path": "/reports/sales",
  "component": "Reports/SalesReport",
  "icon": "BarChartOutlined",
  "sortOrder": 10,
  "status": "active"
}
```

**完成！** 访问 `#/reports/sales` 即可看到新页面。

> 注意：`component` 字段使用 `pages/` 目录下的相对路径，系统会自动解析。

## 菜单类型

### directory（目录）

用作菜单分组，不生成路由：

```json
{
  "type": "directory",
  "name": "报表管理",
  "icon": "FolderOutlined",
  "children": [
    { "type": "page", "path": "/reports/sales", ... }
  ]
}
```

### page（页面）

生成路由和菜单项，必须包含 `path` 和 `component`：

```json
{
  "type": "page",
  "path": "/users",
  "component": "system/User/UserList",
  "name": "用户列表"
}
```

### button（按钮）

仅用于权限控制，不生成路由和菜单项：

```json
{
  "type": "button",
  "permission": "user:delete",
  "name": "删除用户"
}
```

## 高级用法

### 带参数的路由

```json
{
  "type": "page",
  "path": "/users/detail/:id",
  "component": "system/User/UserDetail",
  "hideInMenu": true
}
```

组件中获取参数：

```tsx
import { useParams } from 'react-router-dom';

const UserDetail = () => {
  const { id } = useParams();
  return <div>用户 ID: {id}</div>;
};
```

### 隐藏菜单但保留路由

```json
{
  "path": "/users/edit/:id",
  "component": "system/User/UserEdit",
  "type": "page",
  "hideInMenu": true
}
```

### 公共路由（不需要权限）

在 `DynamicRoutes.tsx` 的 `publicRoutes` 数组中添加：

```tsx
const publicRoutes: RouteObject[] = [
  {
    path: '/about',
    element: <About />,
  },
];
```

## 权限控制

### 工作原理

```
用户登录 → 后端返回用户菜单（基于角色��滤） → 前端生成路由 → 用户只能访问有权限的路由
```

### 按钮级权限

```tsx
<PermissionWrapper permission="user:delete">
  <Button danger>删除</Button>
</PermissionWrapper>
```

## 常见问题

### 组件找不到

错误信息：`Component "XXX" not found for menu: 菜单名`

解决方法：
1. 检查 `component` 字段路径是否正确
2. 检查组件文件是否存在
3. 路径区分大小写

### 路由没有生成

可能原因：
1. 菜单 `status` 为 `inactive`
2. 菜单类型为 `directory` 但没有子菜单
3. `path` 或 `component` 字段缺失

### 刷新页面路由丢失

系统会自动在登录状态下重新获取菜单，无需特殊处理。

## 调试技巧

```javascript
// 查看用户菜单
console.log(store.getState().menu.userMenus);

// 查看已注册组件
import { getRegisteredComponents } from '@/router/utils';
console.log(getRegisteredComponents());
```

## 命名规范

- **组件名**: PascalCase，如 `UserList`、`SalesReport`
- **路径**: kebab-case，如 `/user-management`、`/sales-report`
- **菜单 ID**: 唯一字符串或数字
