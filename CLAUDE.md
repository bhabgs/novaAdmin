# NovaAdmin 开发指南

## 项目概述

React 18 + TypeScript + Ant Design 5 后台管理系统，支持动态路由、国际化、主题切换。

**访问地址**：http://localhost:5173/（不需要启动服务，直接访问）

## 技术栈

React 18.3 | TypeScript 5.8 | Vite 6.3 | Ant Design 5.22 | React Router 7.3 | Redux Toolkit 2.5 | Axios 1.7 | i18next 24.2 | MSW 2.11 | Less + Tailwind CSS

## 常用命令

```bash
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm lint         # ESLint 检查
pnpm check        # TypeScript 类型检查
```

## 目录结构

```
src/
├── api/              # API 请求 (request.ts, auth.ts, user.ts, role.ts, menu.ts, mock/)
├── components/       # 通用组件 (CrudPage, PageContainer, CommonTable, CommonForm, CommonModal)
├── pages/            # 业务页面
│   ├── base/         # Dashboard, Home, Login, Profile, TemplateIntroduction
│   ├── system/       # User, Role, Menu, Icons, Settings
│   └── tools/        # Utils (RichTextEditor, PixiEditor), MarkdownViewer
├── router/           # 动态路由 (componentMap.tsx, generateRoutes.tsx, DynamicRoutes.tsx)
├── store/slices/     # Redux (auth, settings, menu, user, role, dashboard, tabs)
├── i18n/locales/     # 语言文件 (zh-CN, en-US, ar-SA)
├── types/            # TypeScript 类型
├── utils/            # 工具函数
├── hooks/            # 自定义 Hooks
└── layouts/          # 布局组件
```

## API 开发

### 响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
}

// 分页
interface ListResponse<T> {
  list: T[];
  pagination: { page: number; pageSize: number; total: number; };
}
```

### 创建 API
```typescript
// src/api/example.ts
import request from "./request";

export const exampleApi = {
  getList: (params?) => request.get<ListResponse<Example>>("/examples", { params }),
  getById: (id: string) => request.get<Example>(`/examples/${id}`),
  create: (data) => request.post<Example>("/examples", data),
  update: (id, data) => request.put<Example>(`/examples/${id}`, data),
  delete: (id: string) => request.del<void>(`/examples/${id}`),
};
```

### Mock 数据
```typescript
// src/api/mock/example.ts
import { http, HttpResponse } from "msw";
import { delay, createSuccessResponse } from "./utils";

export const exampleHandlers = [
  http.get("/mock-api/examples", async () => {
    await delay();
    return HttpResponse.json(createSuccessResponse({ list: [], pagination: {} }));
  }),
];
// 在 src/api/mock/index.ts 注册
```

**Mock 模式配置：**
- `.env` 中设置 `VITE_USE_MOCK=true` 启用 Mock（使用 `/mock-api` 前缀，避免被服务器代理拦截）
- 设置 `VITE_USE_MOCK=false` 使用真实后端（使用 `/api` 前缀，被 Nginx 代理到后端）

## 动态路由

### 添加新页面（2步）

**Step 1**: 创建组件 `src/pages/system/Example/index.tsx`

**Step 2**: 菜单管理中配置
```typescript
{
  id: "new-id",
  name: "示例页面",
  i18nKey: "menu.example",
  type: "page",           // directory | page | button | iframe
  path: "/example",
  component: "system/Example",  // pages/ 下的相对路径
  icon: "AppstoreOutlined",
  sortOrder: 10,
  status: "active",
  parentId: undefined,
}
```

路径格式：`"base/Dashboard"` → `src/pages/base/Dashboard.tsx`

### Iframe 外部页面

菜单支持 iframe 加载外部页面：
```typescript
{
  id: "external-1",
  name: "外部文档",
  type: "iframe",
  path: "/external/docs",
  externalUrl: "https://ant.design/components/overview-cn",
  icon: "LinkOutlined",
  sortOrder: 20,
  status: "active",
}
```

- `type: "iframe"` - 标记为 iframe 类型
- `externalUrl` - 外部页面 URL
- 自动使用 `IframeContainer` 组件加载

## 国际化

支持：zh-CN (LTR) | en-US (LTR) | ar-SA (RTL)

```typescript
// 使用
const { t } = useTranslation();
<h1>{t("example.title")}</h1>

// 切换语言
import { changeLanguage } from "@/i18n";
changeLanguage("en-US");
```

翻译文件：`src/i18n/locales/{zh-CN,en-US,ar-SA}.json`

## 状态管理

### 创建 Slice
```typescript
// src/store/slices/exampleSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchExamples = createAsyncThunk("example/fetchList", async (_, { rejectWithValue }) => {
  try {
    const response = await exampleApi.getList();
    return response.success ? response.data.list : rejectWithValue(response.message);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const exampleSlice = createSlice({
  name: "example",
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamples.pending, (state) => { state.loading = true; })
      .addCase(fetchExamples.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchExamples.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});
```

在 `src/store/index.ts` 注册 reducer。

### 使用
```typescript
const dispatch = useAppDispatch();
const { list, loading } = useAppSelector((state) => state.example);
useEffect(() => { dispatch(fetchExamples()); }, [dispatch]);
```

## CrudPage 组件

```typescript
import CrudPage, { FilterConfig } from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

const UserList: React.FC = () => {
  const { users, loading, total } = useAppSelector((state) => state.user);
  const listMgmt = useListManagement<User>({
    dispatch, fetchAction: fetchUsers, deleteAction: deleteUser, loadingSelector: loading, totalSelector: total,
  });

  const columns = [{ title: t("user.name"), dataIndex: "name", key: "name" }];
  const filters: FilterConfig[] = [{ key: "status", span: 4, component: <Select>...</Select> }];

  return (
    <CrudPage<User>
      title={t("user.title")} dataSource={users} columns={columns} loading={loading}
      pagination={listMgmt.paginationConfig} rowSelection={listMgmt.rowSelection}
      onSearch={listMgmt.handleSearch} filters={filters}
      onAdd={listMgmt.handleAdd} onEdit={listMgmt.handleEdit}
      onDelete={listMgmt.handleDelete} onBatchDelete={listMgmt.handleBatchDelete}
    />
  );
};
```

## 图标使用

图标库页面：**系统管理 → 图标库**（点击复制图标名）

```typescript
// 按需导入
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
<UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />

// 动态图标（菜单等）
import * as AntdIcons from "@ant-design/icons";
const IconComponent = (AntdIcons as any)["UserOutlined"];
```

菜单配置使用图标名字符串：`icon: "UserOutlined"`

主题：Outlined（线性）| Filled（实心）| TwoTone（双色）

## 代码规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserList.tsx` |
| Hook/工具 | camelCase | `useTheme.ts` |
| 常量 | UPPER_SNAKE | `API_BASE_URL` |

```typescript
// import 顺序：React → React hooks → 第三方库 → 内部模块 → 类型 → 样式

// 事件处理用 useCallback
const handleDelete = useCallback(async (id: string) => {
  await dispatch(deleteUser(id)).unwrap();
  message.success(t("common.deleteSuccess"));
}, [dispatch, t]);

// 避免：any、内联函数、硬编码文本
// 使用：具体类型、useCallback、t() 国际化
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_USE_MOCK | 启用 Mock 模式 | true (dev/prod) |
| VITE_API_BASE_URL | Mock 模式 API 前缀 | /mock-api |
| VITE_REAL_API_BASE_URL | 真实 API 前缀（被 Nginx 代理） | /api |
| VITE_APP_TITLE | 应用标题 | NovaAdmin |

**API 前缀说明：**
- Mock 模式（`VITE_USE_MOCK=true`）：使用 `/mock-api`，MSW 拦截，不被服务器代理
- 真实 API（`VITE_USE_MOCK=false`）：使用 `/api`，Nginx 代理到后端服务器

配置文件：`.env.development` | `.env.preview` | `.env.production`

## 常见问题

1. **路由不生效**：点击菜单管理「刷新路由」或 `dispatch(fetchUserMenus())`
2. **组件找不到**：检查 `componentMap.tsx` 注册，名称区分大小写
3. **Mock 重置**：`localStorage.removeItem("mock_menus_data"); location.reload()`
4. **类型检查**：`pnpm check`
