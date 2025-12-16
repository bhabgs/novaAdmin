# 菜单与组件映射关系

本文档说明菜单配置中的 `component` 字段与实际文件路径的对应关系。

## 映射规则

**新规则（推荐）：直接使用路径映射**

菜单配置 → 动态导入 → 实际文件路径

`component` 字段直接使用 `pages/` 目录下的相对路径，系统会自动添加 `@/pages/` 前缀进行动态导入。

**示例：**
```typescript
// 菜单配置
{
  component: "system/User/UserList"
}

// 自动转换为
lazy(() => import('@/pages/system/User/UserList'))
```

**向后兼容：** 为了兼容旧的配置，系统仍然支持组件名格式（如 `UserList`），会自动从 componentMap.tsx 查找。

## 完整映射表

| 菜单名称 | component 字段（新格式） | 实际文件路径 | 模块分类 |
|---------|------------------------|-------------|---------|
| 模板介绍 | `base/TemplateIntroduction` | `pages/base/TemplateIntroduction/` | 基础模块 |
| Dashboard | `base/Dashboard` | `pages/base/Dashboard.tsx` | 基础模块 |
| 个人资料 | `base/Profile` | `pages/base/Profile/` | 基础模块 |
| 用户管理 | `system/User/UserList` | `pages/system/User/UserList.tsx` | 系统管理 |
| 用户详情 | `system/User/UserDetail` | `pages/system/User/UserDetail.tsx` | 系统管理 |
| 角色管理 | `system/Role/RoleList` | `pages/system/Role/RoleList.tsx` | 系统管理 |
| 菜单管理 | `system/Menu/MenuList` | `pages/system/Menu/MenuList.tsx` | 系统管理 |
| 系统设置 | `system/Settings` | `pages/system/Settings/` | 系统管理 |
| Markdown查看器 | `tools/MarkdownViewer` | `pages/tools/MarkdownViewer/` | 工具模块 |
| 富文本编辑器 | `tools/Utils/RichTextEditor` | `pages/tools/Utils/RichTextEditor/` | 工具模块 |
| Pixi编辑器 | `tools/Utils/PixiEditor` | `pages/tools/Utils/PixiEditor/` | 工具模块 |
| Iframe视图 | `tools/IframeView` | `pages/tools/IframeView/` | 工具模块 |

## 组件注册方式

### 方式一：路径映射（推荐）

**无需手动注册**，直接在菜单配置中使用路径格式：

```typescript
// 菜单配置示例（src/api/mock/menu.ts）
{
  name: "用户管理",
  path: "/users",
  component: "system/User/UserList",  // ← 直接使用相对路径
  type: "page"
}
```

系统会自动将路径转换为动态导入：
- 检测到 `/` → 识别为路径格式
- 自动添加前缀 → `@/pages/system/User/UserList`
- 动态导入 → `lazy(() => import('@/pages/system/User/UserList'))`

### 方式二：组件名映射（向后兼容）

如果使用组件名格式（不含 `/`），系统会从 `componentMap.tsx` 查找：

```typescript
// 菜单配置
{
  component: "UserList"  // ← 组件名格式
}

// 需要在 componentMap.tsx 中注册
export const componentMap = {
  UserList: lazy(() => import('@/pages/system/User/UserList')),
};
```

## 目录结构

```
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
```

## 如何添加新菜单

### 方式一：使用路径格式（推荐）

#### 1. 创建页面组件

```bash
# 例如：创建系统管理下的日志管理
mkdir -p src/pages/system/Log
touch src/pages/system/Log/LogList.tsx
```

#### 2. 在菜单管理中配置

| 字段 | 值 |
|------|-----|
| 菜单名称 | 日志管理 |
| 菜单类型 | page |
| 路由路径 | /logs |
| **组件路径** | **system/Log/LogList** (pages 目录下的相对路径) |
| 父菜单 | 系统管理 |
| 图标 | FileTextOutlined |
| 排序 | 5 |
| 状态 | active |

**就这么简单！** 无需在 componentMap 中注册，系统会自动根据路径加载组件。

### 方式二：使用组件名格式（向后兼容）

#### 1. 创建页面组件

```bash
mkdir -p src/pages/system/Log
touch src/pages/system/Log/LogList.tsx
```

#### 2. 在 componentMap.tsx 中注册

```typescript
// src/router/componentMap.tsx
export const componentMap = {
  // ...existing
  LogList: lazy(() => import('@/pages/system/Log/LogList')),
};
```

#### 3. 在菜单管理中配置

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

**可能原因：**

1. **路径格式错误** - 使用路径格式时，路径不正确
   - 检查 `component` 字段是否匹配实际文件路径
   - 确认文件确实存在于 `src/pages/` 目录下
   - 示例：`system/User/UserList` → 实际路径应为 `src/pages/system/User/UserList.tsx`

2. **组件名称与 componentMap 不匹配** - 使用组件名格式时
   - 检查菜单配置的 `component` 字段
   - 确认该名称在 `componentMap.tsx` 中已注册

**解决方案：**
- **推荐**：使用路径格式 `system/User/UserList`
- 或确保 componentMap 中有正确的注册

### Q2: 控制台显示 "Component not found"

**原因**：动态导入失败

**解决**：
1. 检查组件路径是否正确
   - 路径格式：`component: "system/User/UserList"`
   - 对应文件：`src/pages/system/User/UserList.tsx`
2. 确认文件确实存在
3. 检查文件扩展名（.tsx 或 .ts）
4. 确认组件有默认导出 `export default`

### Q3: 路径大小写问题

**注意**：路径和文件名**严格区分大小写**！

- 正确：`system/User/UserList`
- 错误：`system/user/userlist`、`System/User/UserList`

确保菜单配置中的路径与文件系统中的实际路径大小写完全一致。

## 调试技巧

### 查看路由生成日志

打开浏览器控制台，刷新页面，查看以下日志：
- `[loadComponent]` - 组件加载日志
- `[generateRoutes]` - 路由生成日志

### 查看当前菜单配置

在浏览器控制台执行：

```javascript
console.log(store.getState().menu.userMenus);
```

### 验证路径格式

确保 component 字段格式正确：

```typescript
// 正确的路径格式（推荐）
component: "system/User/UserList"  // 包含 '/'

// 组件名格式（向后兼容）
component: "UserList"  // 不包含 '/'
```

## 优势对比

| 特性 | 路径格式（新） | 组件名格式（旧） |
|------|-------------|----------------|
| 是否需要在 componentMap 注册 | ❌ 不需要 | ✅ 需要 |
| 路径一致性 | ✅ 直观，与文件系统一致 | ❌ 需要查 componentMap |
| 维护成本 | ✅ 低（只需维护菜单配置） | ❌ 高（需同时维护菜单和 componentMap） |
| 新增页面步骤 | 1 步（创建文件 + 配置菜单） | 2 步（创建文件 + 注册 + 配置菜单） |
| 向后兼容 | ✅ 支持 | - |

**推荐使用路径格式**，更简洁、更易维护！
