# 故障排除

## 路由相关问题

### 菜单配置后路由不生效

**快速解决：**

1. 菜单管理页面 → 点击「刷新路由」按钮
2. 或刷新浏览器页面（F5）
3. 或重新登录

### 新菜单显示 404

**检查项：**

```javascript
// 在浏览器控制台查看菜单配置
console.log(store.getState().menu.userMenus);
```

确认：
- `type` 为 `"page"`
- `status` 为 `"active"`
- `path` 格式正确（如 `"/new-page"`）
- `component` 路径正确（如 `"system/NewPage"`）

### 组件找不到

错误：`Component "XXX" not found for menu: 菜单名`

解决：
1. 检查组件文件是否存在于 `src/pages/` 目录
2. 检查 `component` 字段路径是否正确
3. 注意路径**区分大小写**

```
正确：system/User/UserList
错误：system/user/userlist
```

### 嵌套路由不生效

正确配置：

```json
{
  "type": "directory",
  "name": "工具",
  "children": [
    {
      "type": "page",
      "path": "/util/editor",
      "component": "tools/Editor"
    }
  ]
}
```

注意：子路由的 `path` 应该是完整路径。

## Mock 数据问题

### Mock 请求被拦截

如果部署后 Mock 不工作：

1. 检查 `VITE_USE_MOCK=true`
2. 确保 API 前缀为 `/mock-api`（避免被 Nginx 代理）
3. 检查 MSW 是否正确初始化

### 重置 Mock 菜单数据

```javascript
localStorage.removeItem("mock_menus_data");
location.reload();
```

## 调试命令

```javascript
// 查看用户菜单
console.log(store.getState().menu.userMenus);

// 查看已注册组件
import { getRegisteredComponents } from '@/router/utils';
console.log(getRegisteredComponents());

// 查看 Redux 状态
console.log(store.getState());
```

## 完整重置

如果问题持续：

```javascript
// 1. 清除缓存
localStorage.clear();
sessionStorage.clear();

// 2. 硬刷新
// Ctrl/Cmd + Shift + R

// 3. 重新登录
```

## 自检清单

配置新菜单前确认：

- [ ] 页面组件已创建
- [ ] 组件有默认导出 `export default`
- [ ] 菜单 `type` 为 `"page"`
- [ ] 菜单 `status` 为 `"active"`
- [ ] `path` 和 `component` 字段正确
- [ ] 配置后点击「刷新路由」
