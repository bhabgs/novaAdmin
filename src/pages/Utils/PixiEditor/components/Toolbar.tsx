import React from 'react';
import { Button, Tooltip, Divider, Space } from 'antd';
import {
  MousePointer,
  Square,
  Circle,
  Minus,
  Type,
  Image,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { ToolType } from '../types';
import styles from './Toolbar.module.less';

interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleGrid: () => void;
  gridVisible: boolean;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onCopy,
  onDelete,
  onExport,
  onImport,
  onToggleGrid,
  gridVisible,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const tools = [
    {
      type: ToolType.SELECT,
      icon: <MousePointer size={16} />,
      label: '选择',
      shortcut: 'V'
    },
    {
      type: ToolType.RECTANGLE,
      icon: <Square size={16} />,
      label: '矩形',
      shortcut: 'R'
    },
    {
      type: ToolType.CIRCLE,
      icon: <Circle size={16} />,
      label: '圆形',
      shortcut: 'C'
    },
    {
      type: ToolType.LINE,
      icon: <Minus size={16} />,
      label: '直线',
      shortcut: 'L'
    },
    {
      type: ToolType.TEXT,
      icon: <Type size={16} />,
      label: '文本',
      shortcut: 'T'
    },
    {
      type: ToolType.IMAGE,
      icon: <Image size={16} />,
      label: '图片',
      shortcut: 'I'
    },
    {
      type: ToolType.PAN,
      icon: <Move size={16} />,
      label: '平移',
      shortcut: 'H'
    }
  ];

  return (
    <div className={styles.toolbar}>
      {/* 工具组 */}
      <div className={styles.toolGroup}>
        <div className={styles.groupTitle}>工具</div>
        <Space wrap>
          {tools.map(tool => (
            <Tooltip 
              key={tool.type} 
              title={`${tool.label} (${tool.shortcut})`}
              placement="bottom"
            >
              <Button
                type={currentTool === tool.type ? 'primary' : 'default'}
                icon={tool.icon}
                size="small"
                onClick={() => onToolChange(tool.type)}
                className={styles.toolButton}
              />
            </Tooltip>
          ))}
        </Space>
      </div>

      <Divider type="vertical" />

      {/* 编辑操作组 */}
      <div className={styles.toolGroup}>
        <div className={styles.groupTitle}>编辑</div>
        <Space>
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button
              icon={<RotateCcw size={16} />}
              size="small"
              disabled={!canUndo}
              onClick={onUndo}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Y)">
            <Button
              icon={<RotateCw size={16} />}
              size="small"
              disabled={!canRedo}
              onClick={onRedo}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="复制 (Ctrl+C)">
            <Button
              icon={<Copy size={16} />}
              size="small"
              onClick={onCopy}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="删除 (Delete)">
            <Button
              icon={<Trash2 size={16} />}
              size="small"
              onClick={onDelete}
              className={styles.toolButton}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" />

      {/* 视图操作组 */}
      <div className={styles.toolGroup}>
        <div className={styles.groupTitle}>视图</div>
        <Space>
          <Tooltip title="放大 (+)">
            <Button
              icon={<ZoomIn size={16} />}
              size="small"
              onClick={onZoomIn}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="缩小 (-)">
            <Button
              icon={<ZoomOut size={16} />}
              size="small"
              onClick={onZoomOut}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="重置缩放 (Ctrl+0)">
            <Button
              size="small"
              onClick={onResetZoom}
              className={styles.zoomDisplay}
            >
              {Math.round(zoom * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="切换网格 (Ctrl+G)">
            <Button
              type={gridVisible ? 'primary' : 'default'}
              icon={gridVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              size="small"
              onClick={onToggleGrid}
              className={styles.toolButton}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" />

      {/* 文件操作组 */}
      <div className={styles.toolGroup}>
        <div className={styles.groupTitle}>文件</div>
        <Space>
          <Tooltip title="导入">
            <Button
              icon={<Upload size={16} />}
              size="small"
              onClick={onImport}
              className={styles.toolButton}
            />
          </Tooltip>
          <Tooltip title="导出">
            <Button
              icon={<Download size={16} />}
              size="small"
              onClick={onExport}
              className={styles.toolButton}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default Toolbar;