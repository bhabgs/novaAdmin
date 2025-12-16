/**
 * 常量定义
 */

// 默认画布大小
export const DEFAULT_CANVAS_WIDTH = 1920;
export const DEFAULT_CANVAS_HEIGHT = 1080;

// 默认背景色
export const DEFAULT_BACKGROUND_COLOR = 0xf5f5f5;

// 缩放限制
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_STEP = 0.1;

// 网格
export const DEFAULT_GRID_SIZE = 20;
export const GRID_COLOR = 0xdddddd;
export const GRID_ALPHA = 0.5;

// 吸附
export const DEFAULT_SNAP_THRESHOLD = 10;

// 选择框样式
export const SELECTION_COLOR = 0x1890ff;
export const SELECTION_ALPHA = 0.2;
export const SELECTION_BORDER_WIDTH = 2;

// 连接点
export const CONNECTION_POINT_RADIUS = 6;
export const CONNECTION_POINT_COLOR = 0x1890ff;
export const CONNECTION_POINT_HOVER_COLOR = 0x40a9ff;
export const CONNECTION_POINT_ACTIVE_COLOR = 0x096dd9;

// 变换控制
export const TRANSFORM_HANDLE_SIZE = 8;
export const TRANSFORM_HANDLE_COLOR = 0x1890ff;
export const TRANSFORM_ROTATION_HANDLE_OFFSET = 30;

// 管道
export const DEFAULT_PIPE_COLOR = 0x000000;
export const DEFAULT_PIPE_WIDTH = 2;
export const PIPE_HOVER_WIDTH_DELTA = 2;
export const BEZIER_CONTROL_POINT_RADIUS = 6;
export const BEZIER_CONTROL_LINE_WIDTH = 1;
export const BEZIER_CONTROL_LINE_COLOR = 0x1890ff;

// 动画
export const DEFAULT_ANIMATION_SPEED = 1;
export const PARTICLE_SIZE = 4;

// 图层
export const MAX_LAYER_NAME_LENGTH = 50;

// 性能
export const MAX_OBJECTS = 1000;
export const MAX_PIPES = 500;

// 快捷键
export const KEYBOARD_SHORTCUTS = {
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  CUT: 'ctrl+x',
  DELETE: ['delete', 'backspace'],
  SELECT_ALL: 'ctrl+a',
  DESELECT: 'escape',
  DUPLICATE: 'ctrl+d',
  GROUP: 'ctrl+g',
  UNGROUP: 'ctrl+shift+g',
  ZOOM_IN: 'ctrl+=',
  ZOOM_OUT: 'ctrl+-',
  ZOOM_RESET: 'ctrl+0',
  FIT_VIEW: 'ctrl+1',
  HAND_TOOL: 'space',
} as const;

// 默认样式
export const DEFAULT_FILL_COLOR = 0xffffff;
export const DEFAULT_STROKE_COLOR = 0x000000;
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_OPACITY = 1;
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_FONT_FAMILY = 'Arial';
