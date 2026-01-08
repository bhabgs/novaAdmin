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
