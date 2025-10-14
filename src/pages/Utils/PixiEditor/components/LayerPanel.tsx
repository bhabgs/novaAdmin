import React from 'react';
import { Button, Space, Tooltip, Input } from 'antd';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { Layer } from '../types';
import styles from './LayerPanel.module.less';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisible: (layerId: string) => void;
  onLayerToggleLocked: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  getLayerObjectCount: (layerId: string) => number;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerToggleVisible,
  onLayerToggleLocked,
  onLayerAdd,
  onLayerDelete,
  onLayerMoveUp,
  onLayerMoveDown,
  onLayerRename,
  getLayerObjectCount
}) => {
  const [editingLayerId, setEditingLayerId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');

  const handleStartEdit = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleFinishEdit = () => {
    if (editingLayerId && editingName.trim()) {
      onLayerRename(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  const renderLayerItem = (layer: Layer, index: number) => {
    const isSelected = layer.id === selectedLayerId;
    const isEditing = editingLayerId === layer.id;

    return (
      <div
        key={layer.id}
        className={`${styles.layerItem} ${isSelected ? styles.selected : ''}`}
        onClick={() => !isEditing && onLayerSelect(layer.id)}
      >
        <div className={styles.layerContent}>
          {/* 图层名称 */}
          <div className={styles.layerName}>
            {isEditing ? (
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onPressEnter={handleFinishEdit}
                onBlur={handleFinishEdit}
                onKeyDown={(e) => e.key === 'Escape' && handleCancelEdit()}
                size="small"
                autoFocus
                className={styles.nameInput}
              />
            ) : (
              <span onDoubleClick={() => handleStartEdit(layer)}>
                {layer.name}
              </span>
            )}
          </div>

          {/* 图层控制按钮 */}
          <div className={styles.layerControls}>
            <Space size={4}>
              {/* 可见性切换 */}
              <Tooltip title={layer.visible ? '隐藏图层' : '显示图层'}>
                <Button
                  type="text"
                  size="small"
                  icon={layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleVisible(layer.id);
                  }}
                  className={styles.controlButton}
                />
              </Tooltip>

              {/* 锁定切换 */}
              <Tooltip title={layer.locked ? '解锁图层' : '锁定图层'}>
                <Button
                  type="text"
                  size="small"
                  icon={layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleLocked(layer.id);
                  }}
                  className={styles.controlButton}
                />
              </Tooltip>

              {/* 编辑名称 */}
              <Tooltip title="重命名图层">
                <Button
                  type="text"
                  size="small"
                  icon={<Edit3 size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(layer);
                  }}
                  className={styles.controlButton}
                />
              </Tooltip>

              {/* 上移 */}
              <Tooltip title="上移图层">
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronUp size={14} />}
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveUp(layer.id);
                  }}
                  className={styles.controlButton}
                />
              </Tooltip>

              {/* 下移 */}
              <Tooltip title="下移图层">
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronDown size={14} />}
                  disabled={index === layers.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveDown(layer.id);
                  }}
                  className={styles.controlButton}
                />
              </Tooltip>

              {/* 删除 */}
              <Tooltip title="删除图层">
                <Button
                  type="text"
                  size="small"
                  icon={<Trash2 size={14} />}
                  disabled={layers.length <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDelete(layer.id);
                  }}
                  className={`${styles.controlButton} ${styles.deleteButton}`}
                />
              </Tooltip>
            </Space>
          </div>
        </div>

        {/* 图层信息 */}
        <div className={styles.layerInfo}>
          <span className={styles.objectCount}>
            {getLayerObjectCount(layer.id)} 个对象
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layerPanel}>
      {/* 面板标题和操作 */}
      <div className={styles.panelHeader}>
        <h4>图层</h4>
        <Tooltip title="添加新图层">
          <Button
            type="primary"
            size="small"
            icon={<Plus size={14} />}
            onClick={onLayerAdd}
          >
            添加图层
          </Button>
        </Tooltip>
      </div>

      {/* 图层列表 */}
      <div className={styles.layerList}>
        {layers.map((layer, index) => renderLayerItem(layer, index))}
      </div>

      {/* 图层统计 */}
      <div className={styles.panelFooter}>
        <span className={styles.layerCount}>
          共 {layers.length} 个图层
        </span>
      </div>
    </div>
  );
};

export default LayerPanel;