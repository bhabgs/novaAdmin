# PixiJS 图形编辑器

基于 PixiJS 8 的 2D 图形编辑器，专注于流程图、管道图和工业图表的创建。

## 功能特性

- **图形创建** - 矩形、圆形、椭圆、线条、折线、多边形、文本
- **图层管理** - 树形结构、拖拽排序、分组
- **连接点系统** - 输入点、输出点、双向点
- **管道系统** - 直线、折线、贝塞尔曲线、动画效果
- **变换控制** - 选择、移动、缩放、旋转
- **历史记录** - 撤销/重做

## 项目结构

```
PixiEditor/
├── core/
│   ├── PixiEngine.ts          # 渲染引擎
│   ├── GraphicObject.ts       # 图形基类
│   ├── shapes.ts              # 图形类
│   ├── ConnectionPoint.ts     # 连接点
│   ├── Pipe.ts                # 管道系统
│   ├── TransformControls.ts   # 变换控制
│   └── HistoryManager.ts      # 历史记录
├── components/
│   ├── Toolbar.tsx            # 工具栏
│   ├── LayerPanel.tsx         # 图层面板
│   └── PropertyPanel.tsx      # 属性面板
├── types/
│   └── index.ts               # 类型定义
├── utils/
│   ├── constants.ts           # 常量
│   └── helpers.ts             # 辅助函数
└── index.tsx                  # 主入口
```

## 使用方法

```tsx
import PixiEditor from '@/pages/tools/PixiEditor';

function App() {
  return <PixiEditor />;
}
```

## 操作指南

### 选择工具
- **点击** - 选择对象
- **拖拽** - 移动对象
- **框选** - 空白处拖拽框选多个对象
- **Ctrl + 点击** - 添加/移除选择

### 变换控制
- **移动** - 拖拽对象
- **缩放** - 拖拽 8 个控制手柄
- **旋转** - 拖拽顶部旋转手柄

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| Ctrl + Z | 撤销 |
| Ctrl + Y | 重做 |
| Ctrl + C/V | 复制/粘贴 |
| Ctrl + A | 全选 |
| Delete | 删除 |
| Space | 平移画布 |

## API 示例

```typescript
// 创建矩形
const rect = new Rectangle({
  transform: { x: 200, y: 200, scaleX: 1, scaleY: 1, rotation: 0 },
  width: 150,
  height: 100,
  fill: { type: 'solid', color: '#4CAF50', alpha: 1 },
});
engine.addObject(rect);

// 创建管道
const pipe = new Pipe({
  startPointId: startPoint.id,
  endPointId: endPoint.id,
  style: { type: PipeType.Bezier, strokeColor: '#666', strokeWidth: 3 },
  animation: { enabled: true, type: 'particle', speed: 1 },
});
engine.addPipe(pipe);

// 监听事件
engine.on('selectionChanged', ({ selectedIds }) => {
  console.log('Selection:', selectedIds);
});
```

## PixiJS 8 兼容性

项目使用 PixiJS v8，注意 API 变化：

```typescript
// 应用初始化（异步）
const app = new PIXI.Application();
await app.init({ width, height });

// Graphics API
graphics.rect(x, y, w, h);
graphics.fill({ color, alpha });
graphics.stroke({ color, width });

// 交互模式
stage.eventMode = 'static';
```

详见 [PixiJS 8 迁移指南](https://pixijs.com/8.x/guides/migrations/v8)

## 开发计划

- [x] 基础图形创建
- [x] 图层系统
- [x] 连接点系统
- [x] 管道系统
- [ ] 完整变换控制
- [ ] 分组功能
- [ ] 对齐工具
- [ ] 文件导入导出
