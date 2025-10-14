import React from 'react';
import type { IGraphicObject, ObjectProperties, RectangleProperties } from '../types';
import styles from '../index.module.less';

export interface PropertyPanelProps {
  selectedObjects: IGraphicObject[];
  onUpdateProperties: (id: string, props: Partial<ObjectProperties>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObjects,
  onUpdateProperties,
}) => {
  if (selectedObjects.length === 0) {
    return (
      <div className={`${styles['pixi-editor-sidebar']} ${styles.right}`}>
        <div className={styles['pixi-editor-sidebar-header']}>属性</div>
        <div className={styles['pixi-editor-sidebar-content']}>
          <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: 16 }}>
            未选择对象
          </div>
        </div>
      </div>
    );
  }

  const obj = selectedObjects[0];
  const props = obj.properties;

  const handleChange = (key: string, value: any) => {
    onUpdateProperties(obj.id, { [key]: value });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdateProperties(obj.id, {
      position: { ...props.position, [axis]: value },
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    onUpdateProperties(obj.id, {
      size: { ...props.size, [dimension]: value },
    });
  };

  return (
    <div className={`${styles['pixi-editor-sidebar']} ${styles.right}`}>
      <div className={styles['pixi-editor-sidebar-header']}>属性</div>
      <div className={styles['pixi-editor-sidebar-content']}>
        {/* 基础信息 */}
        <div className={styles['property-panel-section']}>
          <div className={styles['property-panel-section-title']}>基础</div>
          <div className={styles['property-panel-section-content']}>
            <div className={styles['property-panel-field']}>
              <label className={styles['property-panel-field-label']}>名称</label>
              <input
                type="text"
                className={styles['property-panel-field-input']}
                value={props.name || ''}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>
            <div className={styles['property-panel-field']}>
              <label className={styles['property-panel-field-label']}>类型</label>
              <input
                type="text"
                className={styles['property-panel-field-input']}
                value={props.type}
                disabled
              />
            </div>
          </div>
        </div>

        {/* 位置 */}
        <div className={styles['property-panel-section']}>
          <div className={styles['property-panel-section-title']}>位置</div>
          <div className={styles['property-panel-section-content']}>
            <div className={styles['property-panel-field-row']}>
              <div className={styles['property-panel-field']}>
                <label className={styles['property-panel-field-label']}>X</label>
                <input
                  type="number"
                  className={styles['property-panel-field-input']}
                  value={Math.round(props.position.x)}
                  onChange={e => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className={styles['property-panel-field']}>
                <label className={styles['property-panel-field-label']}>Y</label>
                <input
                  type="number"
                  className={styles['property-panel-field-input']}
                  value={Math.round(props.position.y)}
                  onChange={e => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 尺寸 */}
        {props.size && (
          <div className={styles['property-panel-section']}>
            <div className={styles['property-panel-section-title']}>尺寸</div>
            <div className={styles['property-panel-section-content']}>
              <div className={styles['property-panel-field-row']}>
                <div className={styles['property-panel-field']}>
                  <label className={styles['property-panel-field-label']}>宽度</label>
                  <input
                    type="number"
                    className={styles['property-panel-field-input']}
                    value={Math.round(props.size.width)}
                    onChange={e => handleSizeChange('width', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className={styles['property-panel-field']}>
                  <label className={styles['property-panel-field-label']}>高度</label>
                  <input
                    type="number"
                    className={styles['property-panel-field-input']}
                    value={Math.round(props.size.height)}
                    onChange={e => handleSizeChange('height', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 旋转和缩放 */}
        <div className={styles['property-panel-section']}>
          <div className={styles['property-panel-section-title']}>变换</div>
          <div className={styles['property-panel-section-content']}>
            <div className={styles['property-panel-field']}>
              <label className={styles['property-panel-field-label']}>
                旋转 ({Math.round((props.rotation * 180) / Math.PI)}°)
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.01"
                value={props.rotation}
                onChange={e => handleChange('rotation', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div className={styles['property-panel-field']}>
              <label className={styles['property-panel-field-label']}>
                透明度 ({Math.round(props.alpha * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.alpha}
                onChange={e => handleChange('alpha', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* 圆角（仅矩形） */}
        {props.type === 'rectangle' && (
          <div className={styles['property-panel-section']}>
            <div className={styles['property-panel-section-title']}>圆角</div>
            <div className={styles['property-panel-section-content']}>
              <div className={styles['property-panel-field']}>
                <label className={styles['property-panel-field-label']}>
                  圆角半径 ({(props as RectangleProperties).cornerRadius || 0}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={(props as RectangleProperties).cornerRadius || 0}
                  onChange={e =>
                    handleChange('cornerRadius', parseFloat(e.target.value))
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 外观 */}
        <div className={styles['property-panel-section']}>
          <div className={styles['property-panel-section-title']}>外观</div>
          <div className={styles['property-panel-section-content']}>
            <div className={styles['property-panel-field']}>
              <label className={styles['property-panel-field-label']}>填充颜色</label>
              <input
                type="color"
                className={styles['property-panel-field-input']}
                value={
                  typeof props.fill === 'number'
                    ? `#${props.fill.toString(16).padStart(6, '0')}`
                    : typeof props.fill === 'string'
                      ? props.fill
                      : '#cccccc'
                }
                onChange={e => handleChange('fill', e.target.value)}
              />
            </div>
            {props.stroke && (
              <>
                <div className={styles['property-panel-field']}>
                  <label className={styles['property-panel-field-label']}>描边颜色</label>
                  <input
                    type="color"
                    className={styles['property-panel-field-input']}
                    value={
                      typeof props.stroke.color === 'number'
                        ? `#${props.stroke.color.toString(16).padStart(6, '0')}`
                        : typeof props.stroke.color === 'string'
                          ? props.stroke.color
                          : '#000000'
                    }
                    onChange={e =>
                      handleChange('stroke', { ...props.stroke, color: e.target.value })
                    }
                  />
                </div>
                <div className={styles['property-panel-field']}>
                  <label className={styles['property-panel-field-label']}>
                    描边宽度 ({props.stroke.width}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={props.stroke.width}
                    onChange={e =>
                      handleChange('stroke', {
                        ...props.stroke,
                        width: parseFloat(e.target.value),
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
