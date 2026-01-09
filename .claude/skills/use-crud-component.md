# 使用 CRUD 通用组件

## 概述

`CrudPage` 是一个通用的 CRUD（增删改查）页面组件，封装了常见的列表展示、新增、编辑、删除功能，大幅减少重复代码。

## 组件位置

```
apps/web/src/components/crud-page.tsx
```

## 基本用法

```tsx
import { CrudPage, Column, FormField } from '@/components/crud-page';
import { Badge } from '@/components/ui/badge';

// 定义列配置
const columns: Column[] = [
  { key: 'name', title: '名称' },
  { key: 'code', title: '编码' },
  {
    key: 'status',
    title: '状态',
    render: (value) => (
      <Badge variant={value === 1 ? 'default' : 'destructive'}>
        {value === 1 ? '启用' : '禁用'}
      </Badge>
    )
  },
];

// 定义表单字段
const formFields: FormField[] = [
  { name: 'name', label: '名称', required: true, placeholder: '请输入名称' },
  { name: 'code', label: '编码', required: true, disabled: (isEdit) => isEdit },
  { name: 'description', label: '描述', type: 'textarea', rows: 3 },
  { name: 'sort', label: '排序', type: 'number' },
];

export default function MyPage() {
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.myModule);

  return (
    <CrudPage
      title="数据管理"
      columns={columns}
      formFields={formFields}
      data={list}
      loading={loading}
      pagination={pagination}
      onAdd={async (data) => {
        await dispatch(createItem(data)).unwrap();
      }}
      onEdit={async (id, data) => {
        await dispatch(updateItem({ id, data })).unwrap();
      }}
      onDelete={async (id) => {
        await dispatch(deleteItem(id)).unwrap();
      }}
      onRefresh={() => {
        dispatch(fetchItems({ page: 1, pageSize: 10 }));
      }}
    />
  );
}
```

## API 参数

### CrudPageProps

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 页面标题 |
| columns | Column[] | 是 | 表格列配置 |
| formFields | FormField[] | 是 | 表单字段配置 |
| data | T[] | 是 | 数据列表 |
| loading | boolean | 否 | 加载状态 |
| pagination | object | 否 | 分页信息 { total, page, pageSize } |
| onAdd | (data) => Promise<void> | 否 | 新增回调 |
| onEdit | (id, data) => Promise<void> | 否 | 编辑回调 |
| onDelete | (id) => Promise<void> | 否 | 删除回调 |
| onRefresh | () => void | 否 | 刷新回调 |
| getRowKey | (record) => string | 否 | 获取行 key，默认 record.id |
| renderActions | (record) => ReactNode | 否 | 自定义操作列 |
| addButtonText | string | 否 | 新增按钮文本，默认"新增" |
| editTitle | string | 否 | 编辑对话框标题，默认"编辑" |
| addTitle | string | 否 | 新增对话框标题，默认"新增" |

### Column 配置

```typescript
interface Column {
  key: string;              // 数据字段名
  title: string;            // 列标题
  render?: (value, record) => ReactNode;  // 自定义渲染
  width?: string;           // 列宽度
}
```

### FormField 配置

```typescript
interface FormField {
  name: string;             // 字段名
  label: string;            // 标签
  type?: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'custom';
  required?: boolean;       // 是否必填
  disabled?: (isEdit: boolean) => boolean;  // 是否禁用
  placeholder?: string;     // 占位符
  options?: { label: string; value: any }[];  // 下拉选项
  render?: (value, onChange, formData) => ReactNode;  // 自定义渲染
  rows?: number;            // textarea 行数
}
```

## 高级用法

### 自定义列渲染

```tsx
const columns: Column[] = [
  {
    key: 'status',
    title: '状态',
    render: (value, record) => (
      <Badge variant={value === 1 ? 'default' : 'destructive'}>
        {value === 1 ? '启用' : '禁用'}
      </Badge>
    ),
  },
];
```

### 自定义表单字段

```tsx
const formFields: FormField[] = [
  {
    name: 'status',
    label: '状态',
    type: 'custom',
    render: (value, onChange) => (
      <Switch
        checked={value === 1}
        onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
      />
    ),
  },
];
```

### 条件禁用字段

```tsx
const formFields: FormField[] = [
  {
    name: 'code',
    label: '编码',
    required: true,
    disabled: (isEdit) => isEdit,  // 编辑时禁用
  },
];
```

### 自定义操作列

```tsx
<CrudPage
  renderActions={(record) => (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handleCustomAction(record)}>
        自定义操作
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
        删除
      </Button>
    </div>
  )}
/>
```

## 完整示例

参考以下页面的实现：
- 角色管理: `apps/web/src/pages/system/role/index.tsx`
- 用户管理: `apps/web/src/pages/system/user/index.tsx`
- 部门管理: `apps/web/src/pages/system/department/index.tsx`

## 注意事项

- 所有回调函数（onAdd、onEdit、onDelete）都应该是异步的
- 表单验证会自动检查必填项
- 成功/失败提示会自动显示
- 编辑时会自动填充现有数据
- 删除操作会显示确认对话框
