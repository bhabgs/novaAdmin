/**
 * 工具栏组件
 */

import React from 'react';
import { Button, Space, Divider, Tooltip } from 'antd';
import {
  SelectOutlined,
  DragOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  LineOutlined,
  FontSizeOutlined,
  UndoOutlined,
  RedoOutlined,
  ExportOutlined,
  ImportOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { ToolbarProps, ToolMode } from '../types';
import styles from './Toolbar.module.less';

const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onImport,
}) => {
  const tools = [
    {
      mode: ToolMode.Select,
      icon: <SelectOutlined />,
      label: '选择',
    },
    {
      mode: ToolMode.Hand,
      icon: <DragOutlined />,
      label: '平移',
    },
    {
      mode: ToolMode.Rectangle,
      icon: <BorderOutlined />,
      label: '矩形',
    },
    {
      mode: ToolMode.Circle,
      icon: <RadiusSettingOutlined />,
      label: '圆形',
    },
    {
      mode: ToolMode.Line,
      icon: <LineOutlined />,
      label: '线条',
    },
    {
      mode: ToolMode.Text,
      icon: <FontSizeOutlined />,
      label: '文本',
    },
    {
      mode: ToolMode.Pipe,
      icon: <LineOutlined rotate={45} />,
      label: '管道',
    },
  ];

  return (
    <div className={styles.toolbar}>
      <Space split={<Divider type="vertical" />}>
        {/* 工具组 */}
        <Space size="small">
          {tools.map((tool) => (
            <Tooltip key={tool.mode} title={tool.label}>
              <Button
                type={toolMode === tool.mode ? 'primary' : 'default'}
                icon={tool.icon}
                onClick={() => onToolChange(tool.mode)}
              />
            </Tooltip>
          ))}
        </Space>

        {/* 操作组 */}
        <Space size="small">
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button
              icon={<UndoOutlined />}
              disabled={!canUndo}
              onClick={onUndo}
            />
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Y)">
            <Button
              icon={<RedoOutlined />}
              disabled={!canRedo}
              onClick={onRedo}
            />
          </Tooltip>
        </Space>

        {/* 文件操作组 */}
        <Space size="small">
          <Tooltip title="导入">
            <Button icon={<ImportOutlined />} onClick={onImport} />
          </Tooltip>
          <Tooltip title="导出">
            <Button icon={<ExportOutlined />} onClick={onExport} />
          </Tooltip>
        </Space>
      </Space>
    </div>
  );
};

export default Toolbar;
