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

## 示例

### 基础页面

```tsx
// apps/web/src/pages/example/Demo/index.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DemoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>示例页面</CardTitle>
      </CardHeader>
      <CardContent>{/* 页面内容 */}</CardContent>
    </Card>
  );
}
```

### 带 API 调用的页面

```tsx
// apps/web/src/pages/example/List/index.tsx
import { useEffect, useState } from 'react';
import { xxxControllerFindAll } from '@/api/services.gen';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await xxxControllerFindAll({ query: { page: 1, pageSize: 10 } });
      const data = response.data?.data || response.data;
      setList(Array.isArray(data) ? data : data.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">列表页面</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">加载中...</TableCell>
            </TableRow>
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">暂无数据</TableCell>
            </TableRow>
          ) : (
            list.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>操作按钮</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
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
