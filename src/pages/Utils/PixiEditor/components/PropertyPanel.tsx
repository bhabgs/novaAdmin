/**
 * 属性面板组件
 */

import React from 'react';
import { Form, InputNumber, Select, ColorPicker, Slider, Switch, Divider } from 'antd';
import { PropertyPanelProps, ObjectProperties } from '../types';
import styles from './PropertyPanel.module.less';

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObjects,
  onUpdateProperties,
}) => {
  if (selectedObjects.length === 0) {
    return (
      <div className={styles.propertyPanel}>
        <div className={styles.empty}>请选择一个对象</div>
      </div>
    );
  }

  // 如果选择了多个对象
  if (selectedObjects.length > 1) {
    return (
      <div className={styles.propertyPanel}>
        <div className={styles.empty}>已选择 {selectedObjects.length} 个对象</div>
      </div>
    );
  }

  const object = selectedObjects[0];

  const handleChange = (field: string, value: any) => {
    onUpdateProperties(object.id, { [field]: value });
  };

  const handleTransformChange = (field: string, value: any) => {
    onUpdateProperties(object.id, {
      transform: { ...object.transform, [field]: value },
    });
  };

  return (
    <div className={styles.propertyPanel}>
      <div className={styles.header}>
        <h3>属性</h3>
      </div>

      <div className={styles.content}>
        <Form layout="vertical" size="small">
          {/* 基础属性 */}
          <Divider orientation="left">基础属性</Divider>

          <Form.Item label="名称">
            <input
              value={object.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={styles.input}
            />
          </Form.Item>

          {/* 位置和尺寸 */}
          <Divider orientation="left">位置和尺寸</Divider>

          <div className={styles.row}>
            <Form.Item label="X">
              <InputNumber
                value={object.transform.x}
                onChange={(val) => handleTransformChange('x', val)}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="Y">
              <InputNumber
                value={object.transform.y}
                onChange={(val) => handleTransformChange('y', val)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          {object.width !== undefined && (
            <div className={styles.row}>
              <Form.Item label="宽度">
                <InputNumber
                  value={object.width}
                  onChange={(val) => handleChange('width', val)}
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label="高度">
                <InputNumber
                  value={object.height}
                  onChange={(val) => handleChange('height', val)}
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
          )}

          {object.radius !== undefined && (
            <Form.Item label="半径">
              <InputNumber
                value={object.radius}
                onChange={(val) => handleChange('radius', val)}
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          {/* 变换 */}
          <Divider orientation="left">变换</Divider>

          <Form.Item label="旋转">
            <Slider
              value={Math.round((object.transform.rotation * 180) / Math.PI)}
              onChange={(val) => handleTransformChange('rotation', (val * Math.PI) / 180)}
              min={0}
              max={360}
            />
          </Form.Item>

          <div className={styles.row}>
            <Form.Item label="缩放 X">
              <InputNumber
                value={object.transform.scaleX}
                onChange={(val) => handleTransformChange('scaleX', val)}
                min={0.1}
                max={10}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="缩放 Y">
              <InputNumber
                value={object.transform.scaleY}
                onChange={(val) => handleTransformChange('scaleY', val)}
                min={0.1}
                max={10}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          {/* 外观 */}
          <Divider orientation="left">外观</Divider>

          <Form.Item label="不透明度">
            <Slider
              value={object.opacity * 100}
              onChange={(val) => handleChange('opacity', val / 100)}
              min={0}
              max={100}
            />
          </Form.Item>

          {object.fill && (
            <Form.Item label="填充颜色">
              <ColorPicker
                value={object.fill.color}
                onChange={(color) =>
                  handleChange('fill', { ...object.fill, color: color.toHexString() })
                }
              />
            </Form.Item>
          )}

          {object.stroke && (
            <>
              <Form.Item label="描边颜色">
                <ColorPicker
                  value={object.stroke.color}
                  onChange={(color) =>
                    handleChange('stroke', {
                      ...object.stroke,
                      color: color.toHexString(),
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="描边宽度">
                <InputNumber
                  value={object.stroke.width}
                  onChange={(val) =>
                    handleChange('stroke', { ...object.stroke, width: val })
                  }
                  min={0}
                  max={20}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </>
          )}

          {/* 其他 */}
          <Divider orientation="left">其他</Divider>

          <Form.Item label="可见">
            <Switch
              checked={object.visible}
              onChange={(val) => handleChange('visible', val)}
            />
          </Form.Item>

          <Form.Item label="锁定">
            <Switch
              checked={object.locked}
              onChange={(val) => handleChange('locked', val)}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default PropertyPanel;
