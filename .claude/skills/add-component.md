# 添加新组件

## 优先级

1. **shadcn/ui 组件** - 首选
2. **扩展 shadcn/ui** - 基于现有组件封装
3. **自定义组件** - 仅在必要时

## 添加 shadcn/ui 组件

```bash
npx shadcn@latest add <component-name>
```

常用组件:

- `button`, `input`, `select`, `checkbox`, `switch`
- `dialog`, `sheet`, `popover`, `tooltip`
- `table`, `card`, `tabs`, `accordion`
- `form`, `label`, `textarea`
- `toast`, `alert`, `badge`

## 自定义组件

路径: `apps/web/src/components/`

```tsx
// apps/web/src/components/my-component.tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export function MyComponent({ className, children }: MyComponentProps) {
  return <div className={cn('base-styles', className)}>{children}</div>;
}
```

## 注意事项

- 使用 `cn()` 合并 className
- 组件文件使用 kebab-case 命名
- 导出使用命名导出（非 default）
