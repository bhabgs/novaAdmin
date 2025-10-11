import React from 'react';
import {
  Form,
  FormProps,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Radio,
  Checkbox,
  Upload,
  TreeSelect,
  Cascader,
  TimePicker,
  Rate,
  Slider,
  ColorPicker,
  Row,
  Col,
} from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'date' | 'dateRange' | 'number' | 'switch' | 'radio' | 'checkbox' | 'upload' | 'treeSelect' | 'cascader' | 'time' | 'rate' | 'slider' | 'color';
  rules?: any[];
  options?: { label: string; value: any }[];
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  span?: number;
  props?: any;
  dependencies?: string[];
  shouldUpdate?: boolean;
  render?: (form: any) => React.ReactNode;
}

export interface CommonFormProps extends FormProps {
  fields: FormFieldConfig[];
  columns?: number;
  loading?: boolean;
}

const CommonForm: React.FC<CommonFormProps> = ({
  fields,
  columns = 2,
  loading = false,
  ...formProps
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const renderField = (field: FormFieldConfig, formInstance: any) => {
    if (field.hidden) return null;

    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      ...field.props,
    };

    const renderFormItem = () => {
      switch (field.type) {
        case 'input':
          return <Input {...commonProps} />;
        
        case 'textarea':
          return <TextArea rows={4} {...commonProps} />;
        
        case 'select':
          return (
            <Select {...commonProps} allowClear>
              {field.options?.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          );
        
        case 'date':
          return <DatePicker {...commonProps} style={{ width: '100%' }} />;
        
        case 'dateRange':
          return <RangePicker {...commonProps} style={{ width: '100%' }} />;
        
        case 'number':
          return <InputNumber {...commonProps} style={{ width: '100%' }} />;
        
        case 'switch':
          return <Switch {...commonProps} />;
        
        case 'radio':
          return (
            <Radio.Group {...commonProps}>
              {field.options?.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          );
        
        case 'checkbox':
          return (
            <Checkbox.Group {...commonProps}>
              {field.options?.map(option => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          );
        
        case 'upload':
          return <Upload {...commonProps}>{commonProps.children}</Upload>;
        
        case 'treeSelect':
          return (
            <TreeSelect
              {...commonProps}
              treeData={field.options}
              style={{ width: '100%' }}
            />
          );
        
        case 'cascader':
          return (
            <Cascader
              {...commonProps}
              options={field.options}
              style={{ width: '100%' }}
            />
          );
        
        case 'time':
          return <TimePicker {...commonProps} style={{ width: '100%' }} />;
        
        case 'rate':
          return <Rate {...commonProps} />;
        
        case 'slider':
          return <Slider {...commonProps} />;
        
        case 'color':
          return <ColorPicker {...commonProps} />;
        
        default:
          return <Input {...commonProps} />;
      }
    };

    if (field.shouldUpdate) {
      return (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            if (field.dependencies) {
              return field.dependencies.some(dep => prevValues[dep] !== currentValues[dep]);
            }
            return true;
          }}
        >
          {(formInstance) => {
            if (field.render) {
              return field.render(formInstance);
            }
            return (
              <Col span={field.span || Math.floor(24 / columns)} key={field.name}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  rules={field.rules}
                  dependencies={field.dependencies}
                >
                  {renderFormItem()}
                </Form.Item>
              </Col>
            );
          }}
        </Form.Item>
      );
    }

    if (field.render) {
      return (
        <Col span={field.span || Math.floor(24 / columns)} key={field.name}>
          {field.render(formInstance)}
        </Col>
      );
    }

    return (
      <Col span={field.span || Math.floor(24 / columns)} key={field.name}>
        <Form.Item
          name={field.name}
          label={field.label}
          rules={field.rules}
          dependencies={field.dependencies}
        >
          {renderFormItem()}
        </Form.Item>
      </Col>
    );
  };

  return (
    <Form form={form} {...formProps}>
      <Row gutter={16}>
        {fields.map(field => renderField(field, form))}
      </Row>
    </Form>
  );
};

export default CommonForm;