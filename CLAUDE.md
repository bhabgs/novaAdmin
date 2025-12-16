# NovaAdmin 开发指南

## 项目概述

NovaAdmin 是一个基于 React 18 + TypeScript + Ant Design 5 的现代化后台管理系统模板，支持动态路由、国际化、主题切换等特性。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.3.1 |
| 语言 | TypeScript | 5.8.3 |
| 构建 | Vite | 6.3.5 |
| UI | Ant Design | 5.22.6 |
| 路由 | React Router | 7.3.0 |
| 状态管理 | Redux Toolkit | 2.5.0 |
| HTTP | Axios | 1.7.9 |
| 国际化 | i18next | 24.2.2 |
| Mock | MSW | 2.11.4 |
| 样式 | Less + Tailwind CSS | - |

## 常用命令

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm build:preview    # 预览构建（带 Mock）
pnpm lint             # ESLint 检查
pnpm check            # TypeScript 类型检查
pnpm preview          # 预览构建产物
```

## 目录结构

```
src/
├── api/                    # API 请求
│   ├── request.ts         # Axios 实例和拦截器
│   ├── auth.ts            # 认证 API
│   ├── user.ts            # 用户 API
│   ├── role.ts            # 角色 API
│   ├── menu.ts            # 菜单 API
│   └── mock/              # MSW Mock 数据
├── components/            # 通用组件
├── pages/                 # 业务页面（按模块分层）
│   ├── base/              # 基础模块
│   │   ├── Dashboard.tsx  # 仪表板
│   │   ├── Home.tsx       # 首页
│   │   ├── Login.tsx      # 登录页
│   │   ├── Profile/       # 个人资料
│   │   └── TemplateIntroduction/  # 模板介绍
│   ├── system/            # 系统管理模块
│   │   ├── User/          # 用户管理
│   │   ├── Role/          # 角色管理
│   │   ├── Menu/          # 菜单管理
│   │   └── Settings/      # 系统设置
│   └── tools/             # 工具模块
│       ├── Utils/         # 工具集
│       │   ├── RichTextEditor/  # 富文本编辑器
│       │   └── PixiEditor/      # 图形编辑器
│       └── MarkdownViewer/      # Markdown 查看器
├── router/                # 动态路由系统
│   ├── componentMap.tsx   # 组件注册表（重要）
│   ├── generateRoutes.tsx # 路由生成器
│   └── DynamicRoutes.tsx  # 动态路由核心
├── store/                 # Redux 状态
│   └── slices/            # Redux 切片
├── i18n/                  # 国际化
│   └── locales/           # 语言文件 (zh-CN, en-US, ar-SA)
├── types/                 # TypeScript 类型
├── utils/                 # 工具函数
├── hooks/                 # 自定义 Hooks
└── layouts/               # 布局组件
```

---

## API 对接指南

### 1. 请求配置

API 基础配置在 `src/api/request.ts`：

```typescript
// 环境变量配置 API 前缀
baseURL: import.meta.env.VITE_API_BASE_URL || '/api'

// 自动添加 Token
headers: { Authorization: `Bearer ${token}` }

// 统一错误处理和 i18n 错误提示
```

### 2. API 响应格式

后端 API 应返回以下格式：

```typescript
interface ApiResponse<T> {
  success: boolean;    // 业务是否成功
  data: T;            // 响应数据
  message: string;    // 提示信息
  code?: number;      // 可选的业务码
}

// 分页列表
interface ListResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### 3. 创建新 API 模块

```typescript
// src/api/example.ts
import request from './request';

export interface Example {
  id: string;
  name: string;
}

export const exampleApi = {
  // 获取列表
  getList: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ list: Example[]; pagination: any }>('/examples', { params }),

  // 获取详情
  getById: (id: string) =>
    request.get<Example>(`/examples/${id}`),

  // 创建
  create: (data: Partial<Example>) =>
    request.post<Example>('/examples', data),

  // 更新
  update: (id: string, data: Partial<Example>) =>
    request.put<Example>(`/examples/${id}`, data),

  // 删除
  delete: (id: string) =>
    request.del<void>(`/examples/${id}`),
};
```

### 4. Mock 数据开发

Mock 通过 MSW 实现，在 `src/api/mock/` 目录下：

```typescript
// src/api/mock/example.ts
import { http, HttpResponse } from 'msw';
import { delay, createSuccessResponse } from './utils';

export const exampleHandlers = [
  http.get('/api/examples', async () => {
    await delay();
    return HttpResponse.json(createSuccessResponse({
      list: [{ id: '1', name: 'Example' }],
      pagination: { page: 1, pageSize: 10, total: 1 }
    }));
  }),
];

// 在 src/api/mock/index.ts 中注册
import { exampleHandlers } from './example';
export const handlers = [...exampleHandlers, ...otherHandlers];
```

**启用/禁用 Mock**：通过 `.env` 文件中的 `VITE_USE_MOCK=true/false`

---

## 国际化配置

### 1. 支持的语言

| 语言 | 代码 | 方向 |
|------|------|------|
| 简体中文 | zh-CN | LTR |
| English | en-US | LTR |
| العربية | ar-SA | RTL |

### 2. 添加翻译

在 `src/i18n/locales/` 对应的 JSON 文件中添加：

```json
// zh-CN.json
{
  "example": {
    "title": "示例页面",
    "add": "添加示例",
    "edit": "编辑示例",
    "deleteConfirm": "确定删除该示例吗？"
  }
}

// en-US.json
{
  "example": {
    "title": "Example Page",
    "add": "Add Example",
    "edit": "Edit Example",
    "deleteConfirm": "Are you sure to delete this example?"
  }
}
```

### 3. 在组件中使用

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('example.title')}</h1>
      <Button>{t('example.add')}</Button>
    </div>
  );
};
```

### 4. 切换语言

```typescript
import { changeLanguage } from '@/i18n';

// 切换到英文
changeLanguage('en-US');
```

---

## 动态路由系统

### 1. 添加新页面（2 步）

**Step 1**: 创建页面组件

```typescript
// src/pages/system/Example/index.tsx
import React from 'react';
import { Card } from 'antd';
import PageContainer from '@/components/PageContainer';

const ExamplePage: React.FC = () => {
  return (
    <PageContainer title="示例页面">
      <Card>页面内容</Card>
    </PageContainer>
  );
};

export default ExamplePage;
```

**Step 2**: 在菜单管理中配置

直接使用 **路径格式**（推荐），无需在 componentMap 中注册：

```typescript
// src/api/mock/menu.ts
{
  id: "new-id",
  name: "示例页面",
  i18nKey: "menu.example",
  type: "page",
  path: "/example",
  component: "system/Example",  // ← 直接使用 pages/ 下的相对路径
  icon: "AppstoreOutlined",
  sortOrder: 10,
  status: "active",
  parentId: undefined,   // 顶级菜单
}
```

**路径格式说明**：
- `component: "base/Dashboard"` → 对应 `src/pages/base/Dashboard.tsx`
- `component: "system/User/UserList"` → 对应 `src/pages/system/User/UserList.tsx`
- 系统会自动查找 `.tsx`、`.ts`、`/index.tsx`、`/index.ts`

**向后兼容**：组件名格式（如 `"Dashboard"`）仍然支持，会从 `componentMap.tsx` 查找。

### 2. 菜单类型说明

| 类型 | 说明 | 是否生成路由 |
|------|------|-------------|
| `directory` | 目录/分组 | 否 |
| `page` | 页面 | 是 |
| `button` | 按钮权限 | 否 |

### 3. 菜单数据结构

```typescript
interface Menu {
  id: string;
  name: string;                       // 菜单名称
  i18nKey?: string;                   // 国际化 key
  type: 'directory' | 'page' | 'button';
  path?: string;                      // 路由路径（page 必填）
  component?: string;                 // 组件名（page 必填）
  icon?: string;                      // 图标名
  sortOrder: number;                  // 排序
  status: 'active' | 'inactive';      // 状态
  parentId?: string;                  // 父菜单 ID
  children?: Menu[];                  // 子菜单
}
```

---

## 状态管理

### 1. 现有 Slices

| Slice | 文件 | 用途 |
|-------|------|------|
| auth | authSlice.ts | 用户认证状态 |
| settings | settingsSlice.ts | 主题、语言、布局 |
| menu | menuSlice.ts | 菜单数据 |
| user | userSlice.ts | 用户列表 |
| role | roleSlice.ts | 角色列表 |
| dashboard | dashboardSlice.ts | 仪表板数据 |
| tabs | tabsSlice.ts | 页签管理 |

### 2. 创建新 Slice

```typescript
// src/store/slices/exampleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exampleApi, Example } from '@/api/example';

interface ExampleState {
  list: Example[];
  current: Example | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

// 异步 Thunk
export const fetchExamples = createAsyncThunk(
  'example/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await exampleApi.getList();
      if (response.success) {
        return response.data.list;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamples.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchExamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = exampleSlice.actions;
export default exampleSlice.reducer;
```

### 3. 注册到 Store

```typescript
// src/store/index.ts
import exampleReducer from './slices/exampleSlice';

const store = configureStore({
  reducer: {
    // ...existing reducers
    example: exampleReducer,
  },
});
```

### 4. 在组件中使用

```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchExamples } from '@/store/slices/exampleSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.example);

  useEffect(() => {
    dispatch(fetchExamples());
  }, [dispatch]);

  return <Table dataSource={list} loading={loading} />;
};
```

---

## 组件开发规范

### 1. 页面组件模板

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import PageContainer from '@/components/PageContainer';

const ExamplePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.example);

  // 事件处理使用 useCallback
  const handleRefresh = useCallback(() => {
    dispatch(fetchExamples());
  }, [dispatch]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <PageContainer title={t('example.title')}>
      <Table dataSource={list} loading={loading} rowKey="id" />
    </PageContainer>
  );
};

export default ExamplePage;
```

### 2. 通用组件

| 组件 | 路径 | 用途 |
|------|------|------|
| **CrudPage** | components/CrudPage | **CRUD 页面组件（推荐）** |
| PageContainer | components/PageContainer | 页面容器（带标题、面包屑） |
| CommonTable | components/CommonTable | 增强型表格 |
| CommonForm | components/CommonForm | 动态表单 |
| CommonModal | components/CommonModal | 模态框 |
| PermissionWrapper | components/PermissionWrapper | 权限包装 |

### 3. CrudPage 组件使用

`CrudPage` 是封装好的 CRUD 页面组件，包含搜索、过滤、表格、分页、增删改查等功能。

**基础用法：**

```typescript
import CrudPage, { FilterConfig } from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { users, loading, total } = useAppSelector((state) => state.user);

  // 使用列表管理 Hook
  const {
    selectedRowKeys,
    isModalVisible,
    editingItem,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    rowSelection,
    paginationConfig,
  } = useListManagement<User>({
    dispatch,
    fetchAction: fetchUsers,
    deleteAction: deleteUser,
    loadingSelector: loading,
    totalSelector: total,
  });

  // 表格列配置
  const columns = [
    { title: t("user.name"), dataIndex: "name", key: "name" },
    { title: t("user.email"), dataIndex: "email", key: "email" },
  ];

  // 过滤器配置
  const filters: FilterConfig[] = [
    {
      key: "status",
      span: 4,
      component: (
        <Select placeholder="状态" allowClear style={{ width: "100%" }}>
          <Option value="active">激活</Option>
          <Option value="inactive">禁用</Option>
        </Select>
      ),
    },
  ];

  return (
    <CrudPage<User>
      title={t("user.title")}
      dataSource={users}
      columns={columns}
      loading={loading}
      pagination={paginationConfig}
      rowSelection={rowSelection}
      selectedRowKeys={selectedRowKeys}
      searchPlaceholder={t("user.searchPlaceholder")}
      onSearch={handleSearch}
      filters={filters}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBatchDelete={handleBatchDelete}
      onRefresh={handleRefresh}
    />
  );
};
```

**CrudPage 主要属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题 |
| `dataSource` | T[] | 表格数据 |
| `columns` | ColumnsType | 表格列配置 |
| `loading` | boolean | 加载状态 |
| `pagination` | object | 分页配置 |
| `rowSelection` | object | 行选择配置 |
| `searchPlaceholder` | string | 搜索框占位文本 |
| `onSearch` | (value) => void | 搜索回调 |
| `filters` | FilterConfig[] | 额外过滤器 |
| `onAdd` | () => void | 添加按钮回调 |
| `onEdit` | (record) => void | 编辑按钮回调 |
| `onDelete` | (id) => void | 删除按钮回调 |
| `onBatchDelete` | () => void | 批量删除回调 |
| `onRefresh` | () => void | 刷新按钮回调 |
| `showOperationColumn` | boolean | 是否显示操作列 |
| `operationColumnRender` | (record) => ReactNode | 自定义操作列 |
| `modalVisible` | boolean | 模态框可见状态 |
| `formContent` | ReactNode | 表单内容 |

### 4. 类型定义

所有类型定义放在 `src/types/` 目录：

```typescript
// src/types/example.ts
export interface Example {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createTime: string;
}

export interface ExampleFormData {
  name: string;
  status: string;
}

export interface ExampleState {
  list: Example[];
  loading: boolean;
}
```

---

## 代码规范

### 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserList.tsx` |
| Hook 文件 | camelCase | `useTheme.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型文件 | camelCase | `user.ts` |
| 常量 | UPPER_SNAKE | `API_BASE_URL` |
| 组件名 | PascalCase | `const UserList: React.FC` |
| 函数名 | camelCase | `handleSubmit` |

### 2. 文件组织

```typescript
// 推荐的 import 顺序
import React from 'react';                    // 1. React
import { useState, useEffect } from 'react';  // 2. React hooks
import { Table, Button } from 'antd';         // 3. 第三方库
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store';     // 4. 内部模块
import { fetchUsers } from '@/store/slices/userSlice';
import type { User } from '@/types/user';     // 5. 类型
import styles from './index.module.less';     // 6. 样式
```

### 3. 事件处理

```typescript
// 使用 useCallback 包装事件处理函数
const handleDelete = useCallback(async (id: string) => {
  try {
    await dispatch(deleteUser(id)).unwrap();
    message.success(t('common.deleteSuccess'));
  } catch (error) {
    message.error(t('common.error'));
  }
}, [dispatch, t]);
```

### 4. 避免的做法

```typescript
// ❌ 避免使用 any
const data: any = response.data;

// ✅ 使用具体类型
const data: User[] = response.data;

// ❌ 避免内联函数
<Button onClick={() => handleClick(id)} />

// ✅ 使用 useCallback
const handleClick = useCallback(() => {...}, []);
<Button onClick={handleClick} />

// ❌ 避免硬编码文本
<Button>删除</Button>

// ✅ 使用国际化
<Button>{t('common.delete')}</Button>
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_USE_MOCK | 是否启用 Mock | true (dev) |
| VITE_API_BASE_URL | API 前缀 | /api |
| VITE_APP_TITLE | 应用标题 | NovaAdmin |
| VITE_APP_VERSION | 应用版本 | 1.0.0 |

**配置文件**：
- `.env.development` - 开发环境
- `.env.preview` - 预览环境
- `.env.production` - 生产环境

---

## 常见问题

### 1. 菜单配置后路由不生效

点击菜单管理页面的「刷新路由」按钮，或手动调用：

```typescript
dispatch(fetchMenus());
dispatch(fetchUserMenus());
```

### 2. 组件找不到警告

确保组件已在 `src/router/componentMap.tsx` 中注册，且名称与菜单配置的 `component` 字段完全一致（区分大小写）。

### 3. Mock 数据重置

清除 localStorage 后刷新：

```javascript
localStorage.removeItem('mock_menus_data');
location.reload();
```

### 4. TypeScript 类型错误

运行类型检查：

```bash
pnpm check
```

---

## 参考文档

- [动态路由使用指南](./DYNAMIC_ROUTING.md)
- [故障排查指南](./TROUBLESHOOTING.md)
- [路由系统技术文档](./src/router/README.md)
- [Ant Design 组件库](https://ant.design/components/overview-cn/)
- [React Router 文档](https://reactrouter.com/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)
