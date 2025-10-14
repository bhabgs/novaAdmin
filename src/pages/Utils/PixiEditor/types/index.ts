import type * as PIXI from 'pixi.js';

// 基础类型定义
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// 对象类型枚举
export enum ObjectType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  TEXT = 'text',
  POLYGON = 'polygon',
  GROUP = 'group',
}

// 连接点类型
export enum ConnectionType {
  INPUT = 'input',
  OUTPUT = 'output',
  BIDIRECTIONAL = 'bidirectional',
}

// 管道类型
export enum PipeType {
  STRAIGHT = 'straight', // 直线
  POLYLINE = 'polyline', // 折线
  CURVE = 'curve', // 曲线
}

// 管道样式
export enum PipeLineStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
}

// 管道端点样式
export enum PipeEndStyle {
  NONE = 'none',
  ARROW = 'arrow',
  CIRCLE = 'circle',
  SQUARE = 'square',
}

// 颜色类型
export type Color = string | number;

// 渐变类型
export interface GradientColor {
  type: 'linear' | 'radial';
  colors: Array<{ offset: number; color: Color }>;
  angle?: number; // 线性渐变角度
}

// 填充类型
export type FillStyle = Color | GradientColor | PIXI.Texture;

// 描边样式
export interface StrokeStyle {
  color: Color;
  width: number;
  style: PipeLineStyle;
}

// 阴影样式
export interface ShadowStyle {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: Color;
}

// 基础属性
export interface BaseProperties {
  id: string;
  type: ObjectType;
  position: Point;
  rotation: number;
  scale: Point;
  alpha: number;
  visible: boolean;
  locked: boolean;
  name: string;
}

// 图形对象属性
export interface ObjectProperties extends BaseProperties {
  size: Size;
  fill?: FillStyle;
  stroke?: StrokeStyle;
  shadow?: ShadowStyle;
  zIndex: number;
}

// 矩形特定属性
export interface RectangleProperties extends ObjectProperties {
  type: ObjectType.RECTANGLE;
  cornerRadius: number;
}

// 圆形特定属性
export interface CircleProperties extends ObjectProperties {
  type: ObjectType.CIRCLE;
  radius: number;
}

// 文本特定属性
export interface TextProperties extends ObjectProperties {
  type: ObjectType.TEXT;
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  textAlign: 'left' | 'center' | 'right';
}

// 贝塞尔曲线控制点
export interface BezierPoint {
  point: Point;
  controlPoint1?: Point;
  controlPoint2?: Point;
}

// 管道样式
export interface PipeStyle {
  color: Color;
  width: number;
  lineStyle: PipeLineStyle;
  dashPattern?: number[];
  startStyle: PipeEndStyle;
  endStyle: PipeEndStyle;
}

// 管道动画配置
export interface PipeAnimationConfig {
  enabled: boolean;
  type: 'particle' | 'dash' | 'gradient';
  speed: number;
  direction: 'forward' | 'backward' | 'bidirectional';
  particleDensity?: number;
  loop: boolean;
}

// 连接点接口
export interface IConnectionPoint {
  id: string;
  parentObjectId: string;
  position: Point; // 相对于父对象的位置
  type: ConnectionType;
  connectedPipes: string[];
  getWorldPosition(): Point;
  canConnectTo(other: IConnectionPoint): boolean;
}

// 管道接口
export interface IPipe {
  id: string;
  startPointId: string;
  endPointId: string;
  style: PipeStyle;
  pipeType: PipeType;
  bezierPoints?: BezierPoint[];
  animation?: PipeAnimationConfig;
  bridgeHeight?: number; // 桥形高度
}

// 图形对象接口
export interface IGraphicObject {
  id: string;
  properties: ObjectProperties;
  pixiObject: PIXI.DisplayObject;
  connectionPoints: IConnectionPoint[];

  updateProperties(props: Partial<ObjectProperties>): void;
  render(): void;
  destroy(): void;
  addConnectionPoint(point: IConnectionPoint): void;
  removeConnectionPoint(pointId: string): void;
}

// 历史记录动作类型
export enum HistoryActionType {
  CREATE = 'create',
  DELETE = 'delete',
  UPDATE = 'update',
  MOVE = 'move',
  TRANSFORM = 'transform',
}

// 历史记录项
export interface HistoryItem {
  type: HistoryActionType;
  timestamp: number;
  objectId: string;
  beforeState?: any;
  afterState?: any;
  description: string;
}

// 选择状态
export interface SelectionState {
  selectedIds: Set<string>;
  selectionBox?: PIXI.Graphics;
  isDragging: boolean;
  dragStart?: Point;
}

// 视图状态
export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  centerX: number;
  centerY: number;
}

// 工具类型
export enum ToolType {
  SELECT = 'select',
  MOVE = 'move',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  TEXT = 'text',
  PIPE = 'pipe',
  BEZIER_EDIT = 'bezier_edit',
}

// 编辑器状态
export interface EditorState {
  currentTool: ToolType;
  objects: Map<string, IGraphicObject>;
  pipes: Map<string, IPipe>;
  connectionPoints: Map<string, IConnectionPoint>;
  selection: SelectionState;
  view: ViewState;
  history: HistoryItem[];
  historyIndex: number;
  isPlaying: boolean; // 动画播放状态
}

// 引擎配置
export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
  autoDensity: boolean;
}

// 事件类型
export interface EditorEvent {
  type: string;
  data?: any;
  timestamp: number;
}

// 导出配置
export interface ExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'json';
  quality?: number;
  scale?: number;
  backgroundColor?: Color;
}
