/**
 * 图层面板组件
 */

import React, { useState } from 'react';
import { Tree, Button, Space, Input, Dropdown } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { LayerPanelProps, LayerNode } from '../types';
import styles from './LayerPanel.module.less';

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedIds,
  onSelectLayer,
  onToggleVisible,
  onToggleLocked,
  onRenameLayer,
  onDeleteLayer,
  onReorderLayer,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // 转换层级数据为Tree组件需要的格式
  const convertToTreeData = (nodes: LayerNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.id,
      title: renderLayerItem(node),
      children: node.children ? convertToTreeData(node.children) : undefined,
    }));
  };

  // 渲染图层项
  const renderLayerItem = (node: LayerNode) => {
    const isEditing = editingId === node.id;

    return (
      <div className={styles.layerItem}>
        <div className={styles.layerInfo}>
          {isEditing ? (
            <Input
              size="small"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleRenameComplete()}
              onPressEnter={() => handleRenameComplete()}
              autoFocus
            />
          ) : (
            <span className={styles.layerName}>{node.name}</span>
          )}
        </div>

        <div className={styles.layerActions} onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            size="small"
            icon={node.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => onToggleVisible(node.id)}
          />
          <Button
            type="text"
            size="small"
            icon={node.locked ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => onToggleLocked(node.id)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'rename',
                  icon: <EditOutlined />,
                  label: '重命名',
                  onClick: () => handleStartRename(node),
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: () => onDeleteLayer(node.id),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    );
  };

  const handleStartRename = (node: LayerNode) => {
    setEditingId(node.id);
    setEditingName(node.name);
  };

  const handleRenameComplete = () => {
    if (editingId && editingName.trim()) {
      onRenameLayer(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const treeData = convertToTreeData(layers);

  return (
    <div className={styles.layerPanel}>
      <div className={styles.header}>
        <h3>图层</h3>
      </div>
      <div className={styles.content}>
        <Tree
          treeData={treeData}
          selectedKeys={selectedIds}
          onSelect={(keys) => {
            if (keys.length > 0) {
              onSelectLayer(keys[0] as string);
            }
          }}
          draggable
          blockNode
        />
      </div>
    </div>
  );
};

export default LayerPanel;
