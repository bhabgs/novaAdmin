import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';

// 工具类型枚举
export enum ToolType {
  SELECT = 'select',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  TEXT = 'text',
  IMAGE = 'image',
  PAN = 'pan',
  ZOOM = 'zoom'
}

// 图层类型
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  container: Container;
  type: 'group' | 'shape' | 'text' | 'image';
}

// 形状对象接口
export interface ShapeObject {
  id: string;
  type: ToolType;
  layerId: string;
  pixiObject: Graphics | Text | Sprite;
  properties: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    alpha: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    src?: string;
  };
}

// 编辑器状态接口
export interface EditorState {
  currentTool: ToolType;
  selectedObjects: string[];
  layers: Layer[];
  activeLayerId: string;
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// 编辑器事件接口
export interface EditorEvents {
  onToolChange: (tool: ToolType) => void;
  onObjectSelect: (objectIds: string[]) => void;
  onObjectCreate: (object: ShapeObject) => void;
  onObjectUpdate: (objectId: string, properties: Partial<ShapeObject['properties']>) => void;
  onObjectDelete: (objectIds: string[]) => void;
  onLayerCreate: (layer: Layer) => void;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onLayerDelete: (layerId: string) => void;
  onStateChange: (state: Partial<EditorState>) => void;
}

// 编辑器数据导入导出格式
export interface EditorData {
  version: string;
  state: EditorState;
  objects: ShapeObject[];
  layers: Layer[];
}

// 编辑器核心接口
export interface PixiEditorCore {
  app: Application;
  state: EditorState;
  objects: Map<string, ShapeObject>;
  init: (container: HTMLElement) => Promise<void>;
  destroy: () => void;
  setTool: (tool: ToolType) => void;
  createObject: (type: ToolType, x: number, y: number) => ShapeObject | null;
  selectObjects: (objectIds: string[]) => void;
  updateObject: (objectId: string, properties: Partial<ShapeObject['properties']>) => void;
  deleteObjects: (objectIds: string[]) => void;
  addLayer: (name: string, type: Layer['type']) => Layer;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  deleteLayer: (layerId: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => string;
  importData: (data: EditorData) => void;
  exportData: () => EditorData;
}

// 工具栏配置
export interface ToolbarConfig {
  tools: {
    type: ToolType;
    icon: string;
    label: string;
    shortcut?: string;
  }[];
}

// 属性面板配置
export interface PropertyPanelConfig {
  sections: {
    title: string;
    properties: {
      key: string;
      label: string;
      type: 'number' | 'text' | 'color' | 'select' | 'checkbox' | 'range';
      min?: number;
      max?: number;
      step?: number;
      options?: { label: string; value: string | number | boolean }[];
    }[];
  }[];
}