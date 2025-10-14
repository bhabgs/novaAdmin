import React from 'react';
import { Square, Circle, Minus, Type, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import type { IGraphicObject, ObjectType } from '../types';
import styles from '../index.module.less';

export interface LayerPanelProps {
  objects: IGraphicObject[];
  selectedIds: Set<string>;
  onSelect: (id: string, multi: boolean) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  objects,
  selectedIds,
  onSelect,
  onToggleVisible,
  onToggleLock,
  onDelete,
}) => {
  const getIcon = (type: ObjectType) => {
    switch (type) {
      case 'rectangle':
        return Square;
      case 'circle':
        return Circle;
      case 'line':
        return Minus;
      case 'text':
        return Type;
      default:
        return Square;
    }
  };

  return (
    <div className={styles['pixi-editor-sidebar']}>
      <div className={styles['pixi-editor-sidebar-header']}>图层</div>
      <div className={styles['pixi-editor-sidebar-content']}>
        {objects.length === 0 ? (
          <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: 16 }}>
            暂无图层
          </div>
        ) : (
          objects.map(obj => {
            const Icon = getIcon(obj.properties.type);
            const isSelected = selectedIds.has(obj.id);

            return (
              <div
                key={obj.id}
                className={`${styles['layer-panel-item']} ${isSelected ? styles.selected : ''}`}
                onClick={e => onSelect(obj.id, e.ctrlKey || e.metaKey)}
              >
                <div className={styles['layer-panel-item-icon']}>
                  <Icon size={14} />
                </div>
                <div className={styles['layer-panel-item-name']}>
                  {obj.properties.name || `${obj.properties.type} ${obj.id.slice(0, 4)}`}
                </div>
                <div className={styles['layer-panel-item-actions']}>
                  <div
                    className={styles['layer-panel-item-action']}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleVisible(obj.id);
                    }}
                    title={obj.properties.visible ? '隐藏' : '显示'}
                  >
                    {obj.properties.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </div>
                  <div
                    className={styles['layer-panel-item-action']}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleLock(obj.id);
                    }}
                    title={obj.properties.locked ? '解锁' : '锁定'}
                  >
                    {obj.properties.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </div>
                  <div
                    className={styles['layer-panel-item-action']}
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(obj.id);
                    }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
