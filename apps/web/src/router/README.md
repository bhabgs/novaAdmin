# 动态路由系统

## 核心文件

| 文件 | 说明 |
|------|------|
| `index.tsx` | 路由入口，使用 HashRouter |
| `DynamicRoutes.tsx` | 动态路由核心组件 |
| `generateRoutes.tsx` | 路由生成器 |
| `componentMap.tsx` | 组件映射表（兼容旧配置） |
| `ProtectedRoute.tsx` | 受保护路由守卫 |
| `PublicRoute.tsx` | 公开路由守卫 |

## 工作流程

```
用户登录 → 获取菜单权限 → 生成路由配置 → 渲染路由
```

## 菜单数据结构

```typescript
interface Menu {
  id: string;
  name: string;
  type: 'directory' | 'page' | 'button';
  path?: string;
  component?: string;
  icon?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  parentId?: string;
  children?: Menu[];
  hideInMenu?: boolean;
}
```

## 核心函数

### generateRoutes.tsx

```typescript
// 将菜单转换为路由配置
generateRoutesFromMenus(menus: Menu[]): RouteObject[]

// 生成完整应用路由
generateAppRoutes(userMenus: Menu[]): RouteObject[]

// 扁平化菜单路径（权限检查用）
flattenMenuPaths(menus: Menu[]): string[]

// 根据路径查找菜单
findMenuByPath(menus: Menu[], path: string): Menu | null
```

## 添加新页面

1. 创建组件 `src/pages/xxx/index.tsx`
2. 菜单管理中配置 `component: "xxx/index"`

系统会自动解析路径并动态导入组件。

## 公共路由

在 `DynamicRoutes.tsx` 添加不需要权限的路由：

```tsx
const publicRoutes: RouteObject[] = [
  { path: '/about', element: <About /> },
];
```

## 注意事项

- 组件路径区分大小写
- `directory` 类型不生成路由
- `hideInMenu: true` 可隐藏菜单但保留路由
