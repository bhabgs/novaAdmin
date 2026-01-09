# 添加新页面

## 路由机制

前端使用**动态路由**，路由配置从后端菜单数据自动生成，无需手动配置路由文件。

## 步骤

1. **创建页面组件**

   - 路径: `apps/web/src/pages/{module}/{PageName}/index.tsx`
   - 使用 shadcn/ui 组件构建 UI
   - 遵循现有页面结构
   - 组件必须使用 `export default` 导出

2. **添加菜单数据**

   - 人为添加菜单，不需要智能体创建

3. **添加国际化**（可选）
   - `apps/web/src/i18n/locales/zh-CN.json`
   - `apps/web/src/i18n/locales/en-US.json`
   - `apps/web/src/i18n/locales/ar-SA.json`

## 可用组件

项目提供了一套可复用的 CRUD 组件，位于 `apps/web/src/components/`：

### 1. CrudPage - 完整 CRUD 页面组件

适用于标准的增删改查页面，一站式解决方案。

```tsx
import { CrudPage, Column, FormField } from '@/components/crud-page';

const columns: Column[] = [
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态', render: (v) => <Badge>{v === 1 ? '启用' : '禁用'}</Badge> },
];

const formFields: FormField[] = [
  { name: 'name', label: '名称', required: true },
  { name: 'status', label: '状态', type: 'custom', render: (v, onChange) => <Switch checked={v === 1} onCheckedChange={(c) => onChange(c ? 1 : 0)} /> },
];

<CrudPage
  title="用户管理"
  columns={columns}
  formFields={formFields}
  data={list}
  loading={loading}
  treeMode={false}           // 是否树形结构
  defaultExpandAll={false}   // 树形默认展开
  onAdd={async (data) => {}}
  onEdit={async (id, data) => {}}
  onDelete={async (id) => {}}
  onRefresh={() => {}}
  addButtonText="新增"
  editTitle="编辑"
  addTitle="新增"
/>
```

### 2. 独立组件 - 灵活组合

适用于需要自定义布局或特殊逻辑的页面。

#### PageContainer - 页面容器

```tsx
import { PageContainer } from '@/components/page-container';

<PageContainer
  title="页面标题"
  onAdd={handleAdd}
  addButtonText="新增"
  toolbarExtra={<SearchInput />}  // 额外的工具栏内容
>
  {/* 页面内容 */}
</PageContainer>
```

#### DataTable - 数据表格

```tsx
import { DataTable, Column } from '@/components/data-table';

<DataTable
  columns={columns}
  data={list}
  loading={loading}
  treeMode={false}
  defaultExpandAll={false}
  onEdit={(record) => {}}
  onDelete={(record) => {}}
  renderActions={(record) => <CustomActions />}  // 自定义操作列
  extraRowActions={(record) => <ExtraMenuItems />}  // 额外的下拉菜单项
/>
```

#### CrudDialog - 表单对话框

```tsx
import { CrudDialog, FormField } from '@/components/crud-dialog';

<CrudDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  formFields={formFields}
  editingRecord={editingRecord}
  onSubmit={async (data, isEdit) => {}}
  editTitle="编辑"
  addTitle="新增"
  getInitialData={(record) => ({ name: record?.name || '' })}
/>
```

#### DeleteDialog - 删除确认对话框

```tsx
import { DeleteDialog } from '@/components/crud-dialog';

<DeleteDialog
  open={deleteId !== null}
  onOpenChange={() => setDeleteId(null)}
  onConfirm={async () => {}}
  title="确认删除"
  description="确定删除该项吗？"
/>
```

## 示例

### 使用 CrudPage（推荐）

```tsx
// apps/web/src/pages/system/user/index.tsx
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers, deleteUser, createUser, updateUser } from '@/store/slices/userSlice';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CrudPage, Column, FormField } from '@/components/crud-page';

export default function UserList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.user);

  const columns: Column[] = [
    { key: 'username', title: t('user.username') },
    { key: 'email', title: t('user.email') },
    {
      key: 'status',
      title: t('common.status'),
      render: (value) => (
        <Badge variant={value === 1 ? 'default' : 'destructive'}>
          {value === 1 ? t('common.enabled') : t('common.disabled')}
        </Badge>
      ),
    },
  ];

  const formFields: FormField[] = [
    { name: 'username', label: '用户名', required: true, disabled: (isEdit) => isEdit },
    { name: 'password', label: '密码', required: true },
    { name: 'email', label: '邮箱' },
    {
      name: 'status',
      label: '状态',
      type: 'custom',
      render: (value, onChange) => (
        <div className="flex items-center gap-2">
          <Switch checked={value === 1} onCheckedChange={(c) => onChange(c ? 1 : 0)} />
          <span className="text-sm text-muted-foreground">{value === 1 ? '启用' : '禁用'}</span>
        </div>
      ),
    },
  ];

  return (
    <CrudPage
      title={t('menu.user')}
      columns={columns}
      formFields={formFields}
      data={list}
      loading={loading}
      pagination={pagination}
      onAdd={async (data) => {
        await dispatch(createUser({ ...data, status: data.status ?? 1 })).unwrap();
      }}
      onEdit={async (id, data) => {
        await dispatch(updateUser({ id, data })).unwrap();
      }}
      onDelete={async (id) => {
        await dispatch(deleteUser(id)).unwrap();
      }}
      onRefresh={() => dispatch(fetchUsers({ page: 1, pageSize: 10 }))}
      addButtonText={t('common.add')}
    />
  );
}
```

### 使用独立组件（灵活组合）

```tsx
// apps/web/src/pages/system/menu/index.tsx
import { useState } from 'react';
import { DataTable, Column } from '@/components/data-table';
import { CrudDialog, DeleteDialog, FormField } from '@/components/crud-dialog';
import { PageContainer } from '@/components/page-container';

export default function MenuList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const columns: Column[] = [/* ... */];
  const formFields: FormField[] = [/* ... */];

  return (
    <PageContainer title="菜单管理" onAdd={() => setDialogOpen(true)}>
      <DataTable
        columns={columns}
        data={tree}
        treeMode
        defaultExpandAll
        onEdit={(record) => { setEditingRecord(record); setDialogOpen(true); }}
        onDelete={(record) => setDeleteId(record.id)}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formFields={formFields}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
```

## FormField 类型说明

```typescript
interface FormField {
  name: string;           // 字段名
  label: string;          // 标签
  type?: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'custom';
  required?: boolean;     // 是否必填
  disabled?: (isEdit: boolean) => boolean;  // 是否禁用
  placeholder?: string;   // 占位符
  options?: { label: string; value: any }[];  // select 选项
  render?: (value: any, onChange: (value: any) => void, formData: any) => ReactNode;  // 自定义渲染
  rows?: number;          // textarea 行数
}
```

## API 调用规范

### 导入方式

```tsx
// 从生成的 API 文件导入
import {
  xxxControllerFindAll,
  xxxControllerCreate,
  xxxControllerUpdate,
  xxxControllerRemove,
} from '@/api/services.gen';
```

### 调用格式

```tsx
// 查询列表
const res = await xxxControllerFindAll({ query: params });
const data = res.data?.data || res.data;

// 创建
await xxxControllerCreate({ body: formData });

// 更新
await xxxControllerUpdate({ path: { id }, body: formData });

// 删除
await xxxControllerRemove({ path: { id } });
```

### 数据处理

统一使用 `response.data?.data || response.data` 处理响应数据，兼容不同的后端响应格式。

## 注意事项

- 优先使用 `@/` 路径别名
- 优先使用 shadcn/ui 组件
- 页面组件使用 `export default`
- API 调用必须使用 OpenAPI 生成的函数（从 `@/api/services.gen` 导入）
- 不要手动编写 API 请求，都使用自动生成的类型安全 API
- 列表数据需要检查是数组还是带分页信息的对象
- 优先使用 `CrudPage` 组件，只有在需要特殊布局时才使用独立组件组合
