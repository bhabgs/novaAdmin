import React from 'react';
import {
  Square,
  Circle,
  Minus,
  Type,
  MousePointer,
  Move,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Download,
  Play,
  Pause,
} from 'lucide-react';
import type { ToolType } from '../types';
import styles from '../index.module.less';

export interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onSave?: () => void;
  onExport?: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onSave,
  onExport,
  isPlaying,
  onTogglePlay,
}) => {
  const tools = [
    { type: 'select' as ToolType, icon: MousePointer, tooltip: '选择工具' },
    { type: 'move' as ToolType, icon: Move, tooltip: '移动工具' },
    { type: 'rectangle' as ToolType, icon: Square, tooltip: '矩形工具' },
    { type: 'circle' as ToolType, icon: Circle, tooltip: '圆形工具' },
    { type: 'line' as ToolType, icon: Minus, tooltip: '线条工具' },
    { type: 'text' as ToolType, icon: Type, tooltip: '文本工具' },
  ];

  return (
    <div className={styles['pixi-editor-toolbar']}>
      {/* 工具组 */}
      <div className={styles['pixi-editor-toolbar-group']}>
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.type}
              className={`${styles['pixi-editor-toolbar-button']} ${
                currentTool === tool.type ? styles.active : ''
              }`}
              onClick={() => onToolChange(tool.type)}
              title={tool.tooltip}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* 操作组 */}
      <div className={styles['pixi-editor-toolbar-group']}>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onUndo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* 视图组 */}
      <div className={styles['pixi-editor-toolbar-group']}>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onZoomIn}
          title="放大"
        >
          <ZoomIn size={16} />
        </button>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onZoomOut}
          title="缩小"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onFitScreen}
          title="适应窗口"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* 动画组 */}
      <div className={styles['pixi-editor-toolbar-group']}>
        <button
          className={styles['pixi-editor-toolbar-button']}
          onClick={onTogglePlay}
          title={isPlaying ? '暂停动画' : '播放动画'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* 文件操作组 */}
      <div className={styles['pixi-editor-toolbar-group']}>
        {onSave && (
          <button
            className={styles['pixi-editor-toolbar-button']}
            onClick={onSave}
            title="保存"
          >
            <Save size={16} />
          </button>
        )}
        {onExport && (
          <button
            className={styles['pixi-editor-toolbar-button']}
            onClick={onExport}
            title="导出"
          >
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
