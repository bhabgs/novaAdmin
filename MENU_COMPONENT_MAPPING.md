# 菜单组件映射

菜单配置中的 `component` 字段对应 `src/pages/` 目录下的相对路径。

## 映射规则

```typescript
// 菜单配置
{ component: "system/User/UserList" }

// 自动转换为
lazy(() => import('@/pages/system/User/UserList'))
```

## 组件映射表

| 菜单名称 | component 字段 | 文件路径 |
|---------|---------------|---------|
| 模板介绍 | `base/TemplateIntroduction` | `pages/base/TemplateIntroduction/` |
| Dashboard | `base/Dashboard` | `pages/base/Dashboard.tsx` |
| 通知中心 | `base/NotificationCenter` | `pages/base/NotificationCenter/` |
| 个人资料 | `base/Profile` | `pages/base/Profile/` |
| 用户管理 | `system/User/UserList` | `pages/system/User/UserList.tsx` |
| 角色管理 | `system/Role/RoleList` | `pages/system/Role/RoleList.tsx` |
| 菜单管理 | `system/Menu/MenuList` | `pages/system/Menu/MenuList.tsx` |
| 系统设置 | `system/Settings` | `pages/system/Settings/` |
| 图标库 | `system/Icons` | `pages/system/Icons/` |
| Markdown查看器 | `tools/MarkdownViewer` | `pages/tools/MarkdownViewer/` |
| 富文本编辑器 | `tools/RichTextEditor` | `pages/tools/RichTextEditor/` |

## 目录结构

```
src/pages/
├── base/              # 基础模块
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Profile/
│   ├── NotificationCenter/
│   └── TemplateIntroduction/
├── system/            # 系统管理
│   ├── User/
│   ├── Role/
│   ├── Menu/
│   ├── Settings/
│   └── Icons/
└── tools/             # 工具模块
    ├── MarkdownViewer/
    └── RichTextEditor/
```

## 添加新页面

1. 在 `src/pages/` 下创建组件文件
2. 在菜单管理中配置 `component` 为相对路径

```json
{
  "name": "日志管理",
  "path": "/logs",
  "component": "system/Log/LogList",
  "type": "page"
}
```

## 注意事项

- 路径**区分大小写**
- 确保文件有默认导出 `export default`
- 支持 `.tsx` 和 `.ts` 扩展名
