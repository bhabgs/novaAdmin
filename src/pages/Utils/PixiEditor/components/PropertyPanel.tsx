import React from 'react';
import { 
  Form, 
  InputNumber, 
  Input, 
  ColorPicker, 
  Slider, 
  Select, 
  Divider,
  Space,
  Typography
} from 'antd';
import { ShapeObject } from '../types';
import styles from './PropertyPanel.module.less';

const { Title } = Typography;

interface PropertyPanelProps {
  selectedObjects: ShapeObject[];
  onPropertyChange: (objectId: string, property: string, value: string | number | boolean) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObjects,
  onPropertyChange
}) => {
  const [form] = Form.useForm();

  // 获取当前选中的对象（如果只选中一个）
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

  // 当选中对象改变时更新表单
  React.useEffect(() => {
    if (selectedObject) {
      form.setFieldsValue({
        x: selectedObject.properties.x,
        y: selectedObject.properties.y,
        width: selectedObject.properties.width,
        height: selectedObject.properties.height,
        rotation: selectedObject.properties.rotation,
        scaleX: selectedObject.properties.scaleX,
        scaleY: selectedObject.properties.scaleY,
        alpha: selectedObject.properties.alpha,
        fill: selectedObject.properties.fill,
        stroke: selectedObject.properties.stroke,
        strokeWidth: selectedObject.properties.strokeWidth,
        text: selectedObject.properties.text,
        fontSize: selectedObject.properties.fontSize,
        fontFamily: selectedObject.properties.fontFamily,
      });
    }
  }, [selectedObject, form]);

  // 处理属性变化
  const handlePropertyChange = (property: string, value: string | number | boolean) => {
    if (selectedObject) {
      onPropertyChange(selectedObject.id, property, value);
    }
  };

  // 如果没有选中对象
  if (!selectedObject) {
    return (
      <div className={styles.propertyPanel}>
        <div className={styles.emptyState}>
          <Title level={5}>属性面板</Title>
          <p>请选择一个对象来编辑其属性</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.propertyPanel}>
      <div className={styles.panelHeader}>
        <Title level={5}>属性面板</Title>
        <span className={styles.objectType}>
          {selectedObject.type === 'rectangle' && '矩形'}
          {selectedObject.type === 'circle' && '圆形'}
          {selectedObject.type === 'line' && '直线'}
          {selectedObject.type === 'text' && '文本'}
          {selectedObject.type === 'image' && '图片'}
        </span>
      </div>

      <div className={styles.panelContent}>
        <Form
          form={form}
          layout="vertical"
          size="small"
          onValuesChange={(changedValues) => {
            Object.entries(changedValues).forEach(([key, value]) => {
              handlePropertyChange(key, value as string | number | boolean);
            });
          }}
        >
          {/* 位置和尺寸 */}
          <div className={styles.section}>
            <Title level={5}>位置和尺寸</Title>
            <Space.Compact block>
              <Form.Item name="x" label="X" style={{ flex: 1 }}>
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  precision={0}
                />
              </Form.Item>
              <Form.Item name="y" label="Y" style={{ flex: 1 }}>
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  precision={0}
                />
              </Form.Item>
            </Space.Compact>

            {(selectedObject.type === 'rectangle' || selectedObject.type === 'image') && (
              <Space.Compact block>
                <Form.Item name="width" label="宽度" style={{ flex: 1 }}>
                  <InputNumber 
                    size="small" 
                    style={{ width: '100%' }}
                    min={1}
                    precision={0}
                  />
                </Form.Item>
                <Form.Item name="height" label="高度" style={{ flex: 1 }}>
                  <InputNumber 
                    size="small" 
                    style={{ width: '100%' }}
                    min={1}
                    precision={0}
                  />
                </Form.Item>
              </Space.Compact>
            )}

            {selectedObject.type === 'circle' && (
              <Form.Item name="width" label="半径">
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  min={1}
                  precision={0}
                />
              </Form.Item>
            )}
          </div>

          <Divider />

          {/* 变换 */}
          <div className={styles.section}>
            <Title level={5}>变换</Title>
            <Form.Item name="rotation" label="旋转角度">
              <Slider
                min={-180}
                max={180}
                step={1}
                marks={{ '-180': '-180°', '0': '0°', '180': '180°' }}
              />
            </Form.Item>

            <Space.Compact block>
              <Form.Item name="scaleX" label="水平缩放" style={{ flex: 1 }}>
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  min={0.1}
                  max={10}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
              <Form.Item name="scaleY" label="垂直缩放" style={{ flex: 1 }}>
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  min={0.1}
                  max={10}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Space.Compact>

            <Form.Item name="alpha" label="透明度">
              <Slider
                min={0}
                max={1}
                step={0.01}
                marks={{ '0': '0%', '0.5': '50%', '1': '100%' }}
              />
            </Form.Item>
          </div>

          <Divider />

          {/* 样式 */}
          {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle') && (
            <div className={styles.section}>
              <Title level={5}>样式</Title>
              <Form.Item name="fill" label="填充颜色">
                <ColorPicker 
                  size="small"
                  showText
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item name="stroke" label="边框颜色">
                <ColorPicker 
                  size="small"
                  showText
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item name="strokeWidth" label="边框宽度">
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  min={0}
                  max={20}
                  precision={0}
                />
              </Form.Item>
            </div>
          )}

          {/* 文本属性 */}
          {selectedObject.type === 'text' && (
            <div className={styles.section}>
              <Title level={5}>文本</Title>
              <Form.Item name="text" label="文本内容">
                <Input.TextArea 
                  size="small"
                  rows={3}
                  placeholder="输入文本内容"
                />
              </Form.Item>

              <Form.Item name="fontSize" label="字体大小">
                <InputNumber 
                  size="small" 
                  style={{ width: '100%' }}
                  min={8}
                  max={200}
                  precision={0}
                />
              </Form.Item>

              <Form.Item name="fontFamily" label="字体">
                <Select 
                  size="small"
                  options={[
                    { label: 'Arial', value: 'Arial' },
                    { label: 'Helvetica', value: 'Helvetica' },
                    { label: '微软雅黑', value: 'Microsoft YaHei' },
                    { label: '宋体', value: 'SimSun' },
                    { label: '黑体', value: 'SimHei' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="fill" label="文字颜色">
                <ColorPicker 
                  size="small"
                  showText
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
          )}

          {/* 图片属性 */}
          {selectedObject.type === 'image' && (
            <div className={styles.section}>
              <Title level={5}>图片</Title>
              <Form.Item name="src" label="图片地址">
                <Input 
                  size="small"
                  placeholder="输入图片URL"
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default PropertyPanel;