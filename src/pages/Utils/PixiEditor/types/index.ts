/**
 * PixiJS 图形编辑器 - 类型定义
 */

import * as PIXI from 'pixi.js';

// ============= 基础类型 =============

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

// ============= 图形对象类型 =============

export enum ObjectType {
  Rectangle = 'rectangle',
  Circle = 'circle',
  Ellipse = 'ellipse',
  Line = 'line',
  Polyline = 'polyline',
  Polygon = 'polygon',
  Text = 'text',
  Group = 'group',
}

export enum ConnectionType {
  Input = 'input',
  Output = 'output',
  BiDirectional = 'bidirectional',
}

// ============= 图形属性 =============

export interface FillStyle {
  type: 'solid' | 'gradient' | 'texture';
  color?: string;
  alpha?: number;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    stops: number[];
    angle?: number;
  };
  texture?: string;
}

export interface StrokeStyle {
  color: string;
  width: number;
  alpha?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  dashArray?: number[];
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
}

export interface ShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // 弧度
  skewX?: number;
  skewY?: number;
}

export interface ObjectProperties {
  id: string;
  type: ObjectType;
  name: string;
  transform: Transform;
  fill?: FillStyle;
  stroke?: StrokeStyle;
  shadow?: ShadowStyle;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  // 特定图形的属性
  width?: number;
  height?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  cornerRadius?: number;
  points?: Point[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

// ============= 连接点 =============

export interface ConnectionPointConfig {
  id: string;
  parentId: string;
  type: ConnectionType;
  position: Point; // 相对于父对象的位置
  offset?: Point; // 可选的偏移量
  direction?: 'top' | 'right' | 'bottom' | 'left'; // 连接方向
}

// ============= 管道系统 =============

export enum PipeType {
  Straight = 'straight', // 直线
  Polyline = 'polyline', // 折线
  Bezier = 'bezier', // 贝塞尔曲线
  Spline = 'spline', // 样条曲线
}

export interface BezierPoint {
  point: Point;
  controlPoint1?: Point;
  controlPoint2?: Point;
}

export interface PipeStyle {
  type: PipeType;
  strokeColor: string;
  strokeWidth: number;
  strokeAlpha?: number;
  dashArray?: number[];
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  // 端点样式
  startArrow?: ArrowStyle;
  endArrow?: ArrowStyle;
  // 桥形效果
  bridgeEnabled?: boolean;
  bridgeHeight?: number;
  bridgeWidth?: number;
}

export interface ArrowStyle {
  type: 'arrow' | 'circle' | 'square' | 'diamond' | 'none';
  size: number;
  filled?: boolean;
}

export interface PipeAnimation {
  enabled: boolean;
  type: 'particle' | 'dash' | 'gradient';
  speed: number; // 速度
  direction: 'forward' | 'backward' | 'bidirectional';
  particleDensity?: number; // 粒子密度
  loop: boolean;
}

export interface PipeConfig {
  id: string;
  startPointId: string;
  endPointId: string;
  style: PipeStyle;
  bezierPoints?: BezierPoint[];
  animation?: PipeAnimation;
}

// ============= 图层系统 =============

export interface LayerNode {
  id: string;
  name: string;
  type: ObjectType | 'pipe';
  visible: boolean;
  locked: boolean;
  children?: LayerNode[];
  parentId?: string;
  expanded?: boolean;
}

// ============= 编辑器状态 =============

export enum ToolMode {
  Select = 'select',
  Hand = 'hand',
  Rectangle = 'rectangle',
  Circle = 'circle',
  Line = 'line',
  Text = 'text',
  Pipe = 'pipe',
  BezierEdit = 'bezier-edit',
}

export interface EditorState {
  toolMode: ToolMode;
  selectedIds: string[];
  hoveredId: string | null;
  clipboardData: ObjectProperties[] | null;
  zoom: number;
  pan: Point;
  gridEnabled: boolean;
  gridSize: number;
  snapEnabled: boolean;
  snapThreshold: number;
}

// ============= 历史记录 =============

export enum ActionType {
  Create = 'create',
  Delete = 'delete',
  Update = 'update',
  Move = 'move',
  Transform = 'transform',
  Group = 'group',
  Ungroup = 'ungroup',
}

export interface HistoryAction {
  type: ActionType;
  timestamp: number;
  objectId: string | string[];
  beforeState?: any;
  afterState?: any;
  description?: string;
}

// ============= 事件系统 =============

export interface EditorEvent {
  type: string;
  target?: any;
  data?: any;
  timestamp: number;
}

export type EventCallback = (event: EditorEvent) => void;

// ============= 导出配置 =============

export interface ExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'json';
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  transparent?: boolean;
  area?: Rect;
}

// ============= 组件 Props =============

export interface ToolbarProps {
  toolMode: ToolMode;
  onToolChange: (mode: ToolMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onImport: () => void;
}

export interface LayerPanelProps {
  layers: LayerNode[];
  selectedIds: string[];
  onSelectLayer: (id: string, multi?: boolean) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

export interface PropertyPanelProps {
  selectedObjects: ObjectProperties[];
  onUpdateProperties: (id: string, props: Partial<ObjectProperties>) => void;
}

export interface CanvasProps {
  width: number;
  height: number;
  onReady?: (app: PIXI.Application) => void;
}
