# 菜单与组件映射关系

本文档说明菜单配置中的 `component` 字段与实际文件路径的对应关系。

## 映射规则

菜单配置 → componentMap.tsx → 实际文件路径

## 完整映射表

| 菜单名称 | component 字段 | 实际文件路径 | 模块分类 |
|---------|---------------|-------------|---------|
| 模板介绍 | `TemplateIntroduction` | `pages/base/TemplateIntroduction/` | 基础模块 |
| Dashboard | `Dashboard` | `pages/base/Dashboard.tsx` | 基础模块 |
| 个人资料 | `Profile` | `pages/base/Profile/` | 基础模块 |
| 用户管理 | `UserList` | `pages/system/User/UserList.tsx` | 系统管理 |
| 用户详情 | `UserDetail` | `pages/system/User/UserDetail.tsx` | 系统管理 |
| 角色管理 | `RoleList` | `pages/system/Role/RoleList.tsx` | 系统管理 |
| 菜单管理 | `MenuList` | `pages/system/Menu/MenuList.tsx` | 系统管理 |
| 系统设置 | `Settings` | `pages/system/Settings/` | 系统管理 |
| Markdown查看器 | `MarkdownViewer` | `pages/tools/MarkdownViewer/` | 工具模块 |
| 富文本编辑器 | `RichTextEditor` | `pages/tools/Utils/RichTextEditor/` | 工具模块 |
| Pixi编辑器 | `PixiEditor` | `pages/tools/Utils/PixiEditor/` | 工具模块 |
| Iframe视图 | `IframeView` | `pages/tools/IframeView/` | 工具模块 |

## 组件注册文件

所有组件必须在 `src/router/componentMap.tsx` 中注册：

\`\`\`typescript
export const componentMap = {
  // 基础模块
  Dashboard: lazy(() => import('@/pages/base/Dashboard')),
  TemplateIntroduction: lazy(() => import('@/pages/base/TemplateIntroduction')),
  Profile: lazy(() => import('@/pages/base/Profile')),

  // 系统管理
  UserList: lazy(() => import('@/pages/system/User/UserList')),
  UserDetail: lazy(() => import('@/pages/system/User/UserDetail')),
  RoleList: lazy(() => import('@/pages/system/Role/RoleList')),
  MenuList: lazy(() => import('@/pages/system/Menu/MenuList')),
  Settings: lazy(() => import('@/pages/system/Settings')),

  // 工具模块
  MarkdownViewer: lazy(() => import('@/pages/tools/MarkdownViewer')),
  RichTextEditor: lazy(() => import('@/pages/tools/Utils/RichTextEditor')),
  PixiEditor: lazy(() => import('@/pages/tools/Utils/PixiEditor')),
  IframeView: lazy(() => import('@/pages/tools/IframeView')),
};
\`\`\`

## 目录结构

\`\`\`
src/pages/
├── base/              # 基础模块
│   ├── Dashboard.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Profile/
│   └── TemplateIntroduction/
│
├── system/            # 系统管理模块
│   ├── User/
│   │   ├── UserList.tsx
│   │   ├── UserDetail.tsx
│   │   └── UserForm.tsx
│   ├── Role/
│   │   └── RoleList.tsx
│   ├── Menu/
│   │   └── MenuList.tsx
│   └── Settings/
│
├── tools/             # 工具模块
│   ├── Utils/
│   │   ├── RichTextEditor/
│   │   └── PixiEditor/
│   ├── MarkdownViewer/
│   └── IframeView/
│
└── Games/             # 游戏模块
\`\`\`

## 如何添加新菜单

### 1. 创建页面组件

\`\`\`bash
# 例如：创建系统管理下的日志管理
mkdir -p src/pages/system/Log
touch src/pages/system/Log/LogList.tsx
\`\`\`

### 2. 在 componentMap.tsx 中注册

\`\`\`typescript
// src/router/componentMap.tsx
export const componentMap = {
  // ...existing
  LogList: lazy(() => import('@/pages/system/Log/LogList')),
};
\`\`\`

### 3. 在菜单管理中配置

| 字段 | 值 |
|------|-----|
| 菜单名称 | 日志管理 |
| 菜单类型 | page |
| 路由路径 | /logs |
| **组件名称** | **LogList** (必须与 componentMap 中的 key 一致) |
| 父菜单 | 系统管理 |
| 图标 | FileTextOutlined |
| 排序 | 5 |
| 状态 | active |

## 常见问题

### Q1: 菜单配置后显示 404

**原因**：组件名称与 componentMap 不匹配

**解决**：
1. 检查菜单配置的 `component` 字段
2. 确认该名称在 `componentMap.tsx` 中已注册
3. 确认组件文件路径正确

### Q2: 控制台显示 "Component not found"

**原因**：componentMap 中的路径错误

**解决**：
1. 检查 import 路径是否正确
2. 确认文件确实存在
3. 使用 `@/pages/` 别名而不是相对路径

### Q3: 组件名称大小写问题

**注意**：组件名称**严格区分大小写**！

- ✅ 正确：`UserList`
- �� 错误：`userlist`、`Userlist`、`userList`

## 调试技巧

### 查看已注册的组件

在浏览器控制台执行：

\`\`\`javascript
import { getRegisteredComponents } from '@/router/componentMap';
console.log(getRegisteredComponents());
\`\`\`

### 查看当前菜单配置

在浏览器控制台执行：

\`\`\`javascript
console.log(store.getState().menu.userMenus);
\`\`\`

### 查看路由生成日志

打开浏览器控制台，刷新页面，查看以 `[generateRoutes]` 开头的日志。
