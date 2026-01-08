# 添加新页面

## 步骤

1. **创建页面组件**

   - 路径: `apps/web/src/pages/{module}/{PageName}/index.tsx`
   - 使用 shadcn/ui 组件构建 UI
   - 遵循现有页面结构

2. **添加路由配置**

   - 文件: `apps/web/src/router/routes.tsx`
   - 添加 lazy 导入和路由配置

3. **添加菜单数据**（如需显示在侧边栏）

   - 通过系统管理 > 菜单管理添加
   - 或直接操作数据库 `sys_menu` 表

4. **添加国际化**
   - `apps/web/src/i18n/locales/zh-CN.json`
   - `apps/web/src/i18n/locales/en-US.json`

## 示例

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

## 注意事项

- 优先使用 `@/` 路径别名
- 优先使用 shadcn/ui 组件
- 页面组件使用 `export default`
