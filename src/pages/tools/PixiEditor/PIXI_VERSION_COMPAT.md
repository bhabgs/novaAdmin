# PixiJS 版本兼容性说明

## 当前版本要求

本项目已更新以支持 **PixiJS v8+** 的新 API。

### 主要变更

#### 1. 应用初始化（异步）
```typescript
// 旧版本
const app = new PIXI.Application({ width, height });

// 新版本（v8+）
const app = new PIXI.Application();
await app.init({ width, height });
```

#### 2. Canvas 访问
```typescript
// 旧版本
app.view

// 新版本
app.canvas
```

#### 3. Graphics API
```typescript
// 旧版本
graphics.beginFill(color, alpha);
graphics.lineStyle(width, color, alpha);
graphics.drawRect(x, y, w, h);
graphics.drawCircle(x, y, r);
graphics.endFill();

// 新版本
graphics.rect(x, y, w, h);
graphics.fill({ color, alpha });
graphics.stroke({ color, width, alpha });

graphics.circle(x, y, r);
graphics.fill({ color, alpha });
```

#### 4. 交互模式
```typescript
// 旧版本
stage.interactive = true;

// 新版本
stage.eventMode = 'static';
```

## 已修复的文件

- ✅ `core/PixiEngine.ts` - 主引擎（异步初始化）
- ✅ `core/shapes.ts` - 所有图形类（新Graphics API）
- ✅ `index.tsx` - 主组件（异步初始化）
- ⚠️ `core/Pipe.ts` - 部分更新（路径绘制需特殊处理）
- ⚠️ `core/ConnectionPoint.ts` - 待更新
- ⚠️ `core/TransformControls.ts` - 待更新

## 待完善功能

由于 PixiJS v8 的 Graphics API 变化较大，以下功能需要额外调整：

1. **管道绘制** (`Pipe.ts`)
   - 贝塞尔曲线绘制需要使用新的路径 API
   - 箭头绘制需要调整填充方式

2. **连接点** (`ConnectionPoint.ts`)
   - 连接点的圆形绘制需要更新

3. **变换控制** (`TransformControls.ts`)
   - 选择框和控制手柄绘制需要更新

## 临时解决方案

如果遇到 Graphics 相关的错误，可以临时使用以下策略：

### 方案 1: 使用兼容层
```typescript
// 在 PixiEngine 初始化时检测版本并使用适配器
```

### 方案 2: 降级 PixiJS
```bash
npm install pixi.js@7.4.2
```

### 方案 3: 完全迁移到 v8 API
参考官方迁移指南：https://pixijs.com/8.x/guides/migrations/v8

## 当前状态

- ✅ 核心渲染引擎可以正常初始化
- ✅ 基础图形（矩形、圆形、文本等）可以正常显示
- ⚠️ 管道系统可能有绘制问题（待测试）
- ⚠️ 连接点可能不显示（待更新）
- ⚠️ 变换控制可能不显示（待更新）

## 建议

对于快速演示，建议：
1. 使用已更新的基础图形功能
2. 暂时禁用管道和连接点功能
3. 或降级到 PixiJS v7.4.2 使用完整功能

对于生产使用，建议：
1. 完整更新所有 Graphics API调用
2. 添加单元测试验证所有绘图功能
3. 性能测试确保渲染效率
