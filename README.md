# NovaAdmin

企业级通用后台管理前端框架（开源）。基于 React + TypeScript + Vite 构建，内置权限、国际化、主题配置、Tab 导航、Mock 数据等常用能力。

**在线预览**：[https://bhabgs.com/nova-admin/](https://bhabgs.com/nova-admin/#/)

## 核心特性

- **权限系统** - 账号登录、受保护路由、基于角色/菜单的权限校验
- **国际化** - 多语言支持（zh-CN / en-US / ar-SA）与 RTL 布局
- **主题配置** - 浅/深色模式、主题色、圆角、布局风格
- **动态路由** - 菜单即路由，后台配置自动生成，无需修改代码
- **页签管理** - Tab 导航、面包屑、页面容器
- **Mock 服务** - MSW 前端 Mock，开箱即用
- **业务模块** - 用户、角色、菜单、仪表盘等示例

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18、TypeScript 5、Vite 6 |
| 路由 | React Router 7 |
| 状态管理 | Redux Toolkit |
| UI | Ant Design 5、@ant-design/charts、Tailwind CSS |
| 国际化 | i18next |
| HTTP | Axios |
| Mock | MSW (Mock Service Worker) |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务
pnpm dev

# 构建生产版本
pnpm build

# 预览构建产物
pnpm preview

# 代码检查
pnpm lint    # ESLint
pnpm check   # TypeScript
```

## 预览截图

| 登录页 | 仪表盘 | 菜单管理 |
|--------|--------|----------|
| ![登录](./public/login.png) | ![仪表盘](./public/index.png) | ![菜单](./public/menu.png) |

## 目录结构

```
src/
├── api/           # 请求封装与 Mock
│   ├── request.ts    # Axios 配置
│   └── mock/         # MSW 模拟数据
├── components/    # 通用组件
│   ├── PageContainer/
│   ├── CrudPage/
│   └── ThemeSettings/
├── pages/         # 业务页面
│   ├── base/         # Dashboard、Login、Profile
│   ├── system/       # User、Role、Menu、Settings
│   └── tools/        # 工具页面
├── router/        # 动态路由系统
├── store/         # Redux 状态管理
├── i18n/          # 国际化配置
├── layouts/       # 布局组件
├── hooks/         # 自定义 Hooks
├── utils/         # 工具函数
└── types/         # TypeScript 类型
```

## 核心功能

### 动态路由

路由配置与菜单管理绑定，添加页面只需 2 步：

1. 创建页面组件 `src/pages/xxx/index.tsx`
2. 在菜单管理中配置 `component: "xxx/index"`

详见 [动态路由文档](./DYNAMIC_ROUTING.md)

### 国际化

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('common.title')}</h1>
```

语言文件：`src/i18n/locales/{zh-CN,en-US,ar-SA}.json`

### 主题配置

通过 ThemeSettings 组件或 Redux settingsSlice 修改主题色、圆角、布局等。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_USE_MOCK | 启用 Mock 模式 | true |
| VITE_API_BASE_URL | API 前缀 | /mock-api |
| VITE_APP_TITLE | 应用标题 | NovaAdmin |

配置文件：`.env.development`、`.env.preview`、`.env.production`

**说明**：项目使用 `/mock-api` 前缀以避免被服务器 Nginx 代理拦截，确保 MSW 能正常工作。

## 相关文档

- [动态路由](./DYNAMIC_ROUTING.md) - 路由系统使用指南
- [故障排除](./TROUBLESHOOTING.md) - 常见问题解决
- [开发指南](./CLAUDE.md) - 详细开发文档

## License

MIT
