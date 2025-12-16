# 动态路由系统

## 概述

本项目使用**动态路由系统**，路由配置不再硬编码，而是根据菜单管理系统中的配置动态生成。这样可以实现：

- ✅ 路由与菜单权限绑定
- ✅ 通过后台配置菜单即可自动生成路由
- ✅ 支持多角色不同路由权限
- ✅ 组件懒加载，提升性能

## 核心文件

### 1. `componentMap.tsx` - 组件映射表

将菜单中的 `component` 字段映射到实际的 React 组件。

```tsx
export const componentMap = {
  Dashboard: lazy(() => import('../pages/Dashboard')),
  UserList: lazy(() => import('../pages/User/UserList')),
  // ...
};
```

**添加新页面步骤：**

1. 在 `componentMap` 中注册组件：
   ```tsx
   NewPage: lazy(() => import('../pages/NewPage'))
   ```

2. 在菜单管理中添加菜单项，设置 `component: 'NewPage'`

3. 路由会自动生成，无需手动配置

### 2. `generateRoutes.tsx` - 路由生成器

根据菜单数据动态生成路由配置。

**核心函数：**

- `generateRoutesFromMenus(menus)` - 将菜单转换为路由配置
- `generateAppRoutes(userMenus)` - 生成完整的应用路由
- `flattenMenuPaths(menus)` - 扁平化菜单路径（用于权限检查）
- `findMenuByPath(menus, path)` - 根据路径查找菜单

### 3. `DynamicRoutes.tsx` - 动态路由组件

主路由组件，负责：

- 获取用户菜单权限
- 生成动态路由配置
- 渲染路由

### 4. `index.tsx` - 路由入口

使用 `HashRouter` + `DynamicRoutes` 实现动态路由。

## 菜单数据结构

菜单数据需要包含以下字段：

```typescript
interface Menu {
  id: string;
  name: string;              // 菜单名称
  type: 'directory' | 'page' | 'button';  // 菜单类型
  path?: string;             // 路由路径，如 '/users'
  component?: string;        // 组件名称，如 'UserList'
  icon?: string;             // 图标
  sortOrder: number;         // 排序
  status: 'active' | 'inactive';  // 状态
  parentId?: string;         // 父菜单ID
  children?: Menu[];         // 子菜单
}
```

### 菜单类型说明

- **directory（目录）**: 作为分组，不生成路由，只处理子菜单
- **page（页面）**: 生成路由，需要 `path` 和 `component` 字段
- **button（按钮）**: 不生成路由，仅用于权限控制

## 使用示例

### 1. 添加新页面路由

#### 步骤 1: 创建页面组件

```tsx
// src/pages/NewFeature/index.tsx
const NewFeature: React.FC = () => {
  return <div>新功能页面</div>;
};

export default NewFeature;
```

#### 步骤 2: 注册到 componentMap

```tsx
// src/router/componentMap.tsx
export const componentMap = {
  // ...existing components
  NewFeature: lazy(() => import('../pages/NewFeature')),
};
```

#### 步骤 3: 在菜单管理中添加菜单

通过菜单管理界面或 Mock 数据添加：

```typescript
{
  id: '999',
  name: '新功能',
  type: 'page',
  path: '/new-feature',
  component: 'NewFeature',
  icon: 'AppstoreOutlined',
  sortOrder: 10,
  status: 'active',
}
```

路由 `/new-feature` 会自动生成并可访问！

### 2. 添加嵌套路由

```typescript
{
  id: '100',
  name: '用户管理',
  type: 'directory',
  icon: 'UserOutlined',
  children: [
    {
      id: '101',
      name: '用户列表',
      type: 'page',
      path: '/users',
      component: 'UserList',
    },
    {
      id: '102',
      name: '用户详情',
      type: 'page',
      path: '/users/detail/:id',
      component: 'UserDetail',
    },
  ],
}
```

### 3. 权限控制

通过菜单的 `status` 字段和用户角色控制：

- `status: 'inactive'` - 菜单不会生成路由
- 只有用户有权限的菜单才会返回，从而控制路由权限

## 工作流程

```
用户登录
  ↓
获取用户菜单权限 (fetchUserMenus)
  ↓
根据菜单生成路由配置 (generateAppRoutes)
  ↓
动态渲染路由 (DynamicRoutes)
  ↓
用户可访问有权限的页面
```

## 注意事项

1. **组件名称必须匹配**：菜单中的 `component` 字段必须与 `componentMap` 中的键名一致

2. **路径格式**：
   - 支持动态参数：`/users/detail/:id`
   - 支持嵌套路径：`/util/markdown-viewer`

3. **懒加载**：所有页面组件都使用 `lazy()` 懒加载，提升首屏性能

4. **缓存处理**：用户菜单在 Redux store 中缓存，刷新页面需重新获取

## 旧路由系统迁移

原有的静态路由配置文件 `routes.tsx` 已被标记为 `@deprecated`，保留仅作参考。

所有路由现在由菜单系统管理，修改路由请通过菜单管理界面操作。

## 常见问题

### Q: 如何添加不需要权限的公共路由？

A: 在 `DynamicRoutes.tsx` 的 `publicRoutes` 数组中添加：

```tsx
const publicRoutes: RouteObject[] = [
  // ...existing routes
  {
    path: '/public-page',
    element: <PublicPage />,
  },
];
```

### Q: 组件未找到的警告怎么办？

A: 检查：
1. 组件是否已在 `componentMap` 中注册
2. 菜单配置的 `component` 字段是否拼写正确
3. 组件文件路径是否正确

### Q: 如何调试路由生成？

A: 在浏览器控制台查看：
- Redux DevTools 查看 `menu.userMenus` 状态
- 查看控制台警告信息
- 在 `generateRoutes.tsx` 中添加 `console.log` 调试

## 扩展建议

1. **路由缓存优化**：可以添加路由配置缓存到 localStorage
2. **权限粒度控制**：可以基于 `permission` 字段实现更细粒度的权限
3. **路由动画**：可以在 `Suspense fallback` 中添加过渡动画
4. **面包屑自动生成**：基于路由层级自动生成面包屑导航

## 总结

动态路由系统让路由配置更加灵活和可维护，实现了权限与路由的统一管理。新增页面只需在菜单管理中配置，无需修改代码，大大提升了开发效率。
