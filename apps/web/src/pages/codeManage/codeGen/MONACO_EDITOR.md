# Monaco Editor 代码展示升级

## 更新说明

将代码生成预览页面的代码展示从 `react-syntax-highlighter` 升级为 `Monaco Editor`（VS Code 编辑器）。

## 主要改进

### 1. 更强大的编辑器功能

**Monaco Editor** 是 Visual Studio Code 的核心编辑器组件，提供：

- ✅ 完整的语法高亮
- ✅ 代码折叠
- ✅ 小地图（Minimap）
- ✅ IntelliSense（智能提示）
- ✅ 代码格式化
- ✅ 查找/替换
- ✅ 多光标编辑
- ✅ 自动补全

### 2. 文件树导航

新增左侧文件树，类似 VS Code 的项目结构：

```
├── backend（后端）
│   ├── user.entity.ts
│   ├── user.dto.ts
│   ├── user.controller.ts
│   └── user.service.ts
└── frontend（前端）
    ├── UserList.tsx
    ├── UserForm.tsx
    ├── types.ts
    └── api.ts
```

### 3. 更好的用户体验

- **文件路径显示**：每个文件显示完整路径
- **点击切换**：在文件树中点击文件即可查看
- **图标标识**：文件夹和文件有不同图标
- **展开/折叠**：可以展开或折叠文件夹
- **快速复制**：每个文件都有独立的复制按钮

## 安装的依赖

```bash
pnpm add @monaco-editor/react
```

## 技术细节

### 编辑器配置

```typescript
<Editor
  height="600px"
  language="typescript"
  value={code}
  theme="vs-dark"
  options={{
    readOnly: true,           // 只读模式
    minimap: { enabled: true }, // 启用小地图
    fontSize: 14,             // 字体大小
    lineNumbers: 'on',        // 显示行号
    scrollBeyondLastLine: false,
    automaticLayout: true,    // 自动调整布局
    folding: true,           // 启用代码折叠
    wordWrap: 'on',          // 自动换行
  }}
/>
```

### 文件结构

```typescript
interface CodeFile {
  key: string;      // 唯一标识
  title: string;    // 文件名
  code: string;     // 代码内容
  language: string; // 语言类型
  path: string;     // 完整路径
}
```

### 布局

- **左侧（25%）**：文件树
- **右侧（75%）**：代码编辑器

## 功能对比

| 功能 | react-syntax-highlighter | Monaco Editor |
|------|-------------------------|---------------|
| 语法高亮 | ✅ | ✅ |
| 代码折叠 | ❌ | ✅ |
| 小地图 | ❌ | ✅ |
| 查找替换 | ❌ | ✅ |
| 多光标 | ❌ | ✅ |
| 智能提示 | ❌ | ✅ |
| 文件树导航 | ❌ | ✅ |
| 自动补全 | ❌ | ✅ |
| 性能 | 中 | 高 |
| 包体积 | 小 | 中 |

## 使用示例

### 生成代码后的界面

1. **左侧文件树**：显示所有生成的文件，按后端/前端分组
2. **右侧编辑器**：
   - 顶部显示当前文件名和路径
   - 代码区域使用 VS Code 暗色主题
   - 右上角有复制按钮

### 交互流程

1. 点击 "AI 生成代码" 按钮
2. 等待生成完成（约3秒）
3. 自动选择第一个文件显示
4. 在左侧文件树中点击其他文件切换查看
5. 点击 "复制" 按钮复制当前文件代码
6. 点击 "下载全部代码" 下载 ZIP 包

## 主题支持

当前使用 `vs-dark` 主题（深色），可选主题：

- `vs` - 浅色主题
- `vs-dark` - 深色主题（当前）
- `hc-black` - 高对比度黑色主题

## 性能优化

- **按需加载**：Monaco Editor 仅在需要时加载
- **虚拟滚动**：文件树支持大量文件
- **自动布局**：编辑器自动适应容器大小
- **只读模式**：禁用编辑功能提升性能

## 浏览器兼容性

Monaco Editor 支持：

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- 移动浏览器 ⚠️（功能受限）

## 未来增强

- [ ] 支持搜索文件
- [ ] 支持代码对比（Diff）
- [ ] 支持多文件同时编辑
- [ ] 支持自定义主题
- [ ] 支持代码格式化
- [ ] 支持导出 PDF
