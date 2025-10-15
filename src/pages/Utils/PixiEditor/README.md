# PixiJS 图形编辑器

基于 PixiJS 的高性能 2D 图形编辑器，专注于流程图、管道图和工业图表的创建与编辑。

## 功能特性

### 核心功能
- ✅ 高性能渲染：基于 WebGL 的硬件加速渲染
- ✅ 图形创建：支持矩形、圆形、椭圆、线条、折线、多边形、文本等
- ✅ 图层管理：完整的树形图层结构，支持拖拽排序
- ✅ 属性编辑：位置、尺寸、旋转、缩放、填充、描边等
- ✅ 连接点系统：支持输入点、输出点、双向点
- ✅ 管道系统：直线、折线、贝塞尔曲线管道
- ✅ 管道动画：粒子流动、虚线移动、渐变流动
- ✅ 变换控制：选择、移动、缩放、旋转
- ✅ 历史记录：撤销/重做功能

### 交互功能
- 选择工具：单选、多选、框选
- 平移工具：画布拖拽平移
- 缩放功能：鼠标滚轮缩放
- 智能吸附：网格吸附、对象吸附
- 连接点高亮：自动识别可连接的点

## 项目结构

```
src/pages/Utils/PixiEditor/
├── core/                           # 核心模块
│   ├── PixiEngine.ts              # 渲染引擎
│   ├── GraphicObject.ts           # 图形对象基类
│   ├── shapes.ts                  # 具体图形类
│   ├── ConnectionPoint.ts         # 连接点系统
│   ├── Pipe.ts                    # 管道系统
│   ├── TransformControls.ts       # 变换控制
│   ├── HistoryManager.ts          # 历史记录管理
│   └── EventEmitter.ts            # 事件发射器
├── components/                     # UI组件
│   ├── Toolbar.tsx                # 工具栏
│   ├── LayerPanel.tsx             # 图层面板
│   └── PropertyPanel.tsx          # 属性面板
├── types/                         # 类型定义
│   └── index.ts
├── utils/                         # 工具函数
│   ├── constants.ts               # 常量
│   └── helpers.ts                 # 辅助函数
├── index.tsx                      # 主入口
├── index.module.less             # 样式
└── PRODUCT_SPEC.md               # 产品规格文档
```

## 技术架构

### 技术栈
- **前端框架**: React 18 + TypeScript
- **渲染引擎**: PixiJS 7.x
- **UI 组件库**: Ant Design
- **状态管理**: React Hooks
- **样式方案**: Less + CSS Modules

### 核心模块

#### 1. PixiEngine（渲染引擎）
负责整个编辑器的渲染和交互管理：
- 管理 PixiJS 应用实例
- 图层系统管理（背景层、对象层、管道层、控制层）
- 视图变换（缩放、平移）
- 事件分发

#### 2. GraphicObject（图形对象系统）
基于继承的图形对象系统：
- `GraphicObject`: 抽象基类
- `Rectangle`: 矩形
- `Circle`: 圆形
- `Ellipse`: 椭圆
- `Line`: 线条
- `Polyline`: 折线
- `Polygon`: 多边形
- `Text`: 文本

#### 3. ConnectionPoint（连接点系统）
管道连接点管理：
- 支持输入点、输出点、双向点
- 自动识别可连接的点
- 连接规则验证
- `ConnectionPointFactory`: 为不同图形创建默认连接点

#### 4. Pipe（管道系统）
管道绘制和动画：
- 直线、折线、贝塞尔曲线
- 箭头端点样式
- 粒子流动动画
- 贝塞尔控制点编辑

#### 5. TransformControls（变换控制）
对象选择和变换：
- 选择框显示
- 8个缩放手柄
- 旋转手柄
- 拖拽变换

#### 6. HistoryManager（历史记录）
撤销/重做功能：
- 操作历史记录
- 可配置历史栈大小
- 支持批量操作

## 使用方法

### 基本使用

```tsx
import PixiEditor from '@/pages/Utils/PixiEditor';

function App() {
  return <PixiEditor />;
}
```

### 创建图形

```typescript
// 创建矩形
const rect = new Rectangle({
  transform: { x: 200, y: 200, scaleX: 1, scaleY: 1, rotation: 0 },
  width: 150,
  height: 100,
  fill: { type: 'solid', color: '#4CAF50', alpha: 1 },
  stroke: { color: '#2E7D32', width: 2, alpha: 1 },
});
engine.addObject(rect);

// 创建圆形
const circle = new Circle({
  transform: { x: 500, y: 200, scaleX: 1, scaleY: 1, rotation: 0 },
  radius: 60,
  fill: { type: 'solid', color: '#2196F3', alpha: 1 },
});
engine.addObject(circle);
```

### 添加连接点

```typescript
// 为矩形添加连接点
const points = ConnectionPointFactory.createForRectangle(rect.id, 150, 100);
points.forEach((point) => {
  point.setParent(rect);
  engine.addConnectionPoint(point);
});
```

### 创建管道

```typescript
const pipe = new Pipe({
  id: generateId('pipe'),
  startPointId: startPoint.id,
  endPointId: endPoint.id,
  style: {
    type: PipeType.Bezier,
    strokeColor: '#666666',
    strokeWidth: 3,
    endArrow: { type: 'arrow', size: 12, filled: true },
  },
  animation: {
    enabled: true,
    type: 'particle',
    speed: 1,
    direction: 'forward',
    particleDensity: 5,
    loop: true,
  },
});
pipe.setConnectionPoints(startPoint, endPoint);
engine.addPipe(pipe);
```

## 快捷键

- `Ctrl + Z`: 撤销
- `Ctrl + Y`: 重做
- `Ctrl + C`: 复制
- `Ctrl + V`: 粘贴
- `Delete/Backspace`: 删除
- `Ctrl + A`: 全选
- `Space`: 平移工具（按住拖拽）

## 扩展开发

### 自定义图形

```typescript
class CustomShape extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Custom, properties);
    this.render();
  }

  protected render(): void {
    // 实现自定义渲染逻辑
    this.graphics.clear();
    // ... 绘制代码
  }

  public clone(): CustomShape {
    return new CustomShape(this.getProperties());
  }
}
```

### 监听事件

```typescript
// 监听对象添加
engine.on('objectAdded', ({ object }) => {
  console.log('Object added:', object);
});

// 监听选择变化
engine.on('selectionChanged', ({ selectedIds }) => {
  console.log('Selection changed:', selectedIds);
});

// 监听缩放变化
engine.on('zoom', ({ zoom, oldZoom }) => {
  console.log('Zoom changed:', zoom);
});
```

## 性能优化

- 对象池复用
- 批量渲染
- 视口裁剪
- LOD（Level of Detail）
- 事件委托

## 后续开发计划

### 第一阶段（已完成）
- ✅ 基础架构搭建
- ✅ 核心渲染引擎
- ✅ 基础图形创建
- ✅ 图层系统
- ✅ 连接点和管道系统

### 第二阶段（进行中）
- [ ] 贝塞尔曲线编辑器
- [ ] 管道交叉桥形效果
- [ ] 完整的变换控制
- [ ] 框选功能

### 第三阶段（计划）
- [ ] 分组功能
- [ ] 对齐和分布
- [ ] 网格和标尺
- [ ] 导航器（小地图）
- [ ] 插件系统

### 第四阶段（计划）
- [ ] 文件导入导出（JSON、SVG）
- [ ] 模板库
- [ ] 性能优化
- [ ] 单元测试

## 许可证

MIT License

## 参与贡献

欢迎提交 Issue 和 Pull Request！
