import React, { useState } from 'react';
import { Form, Row, Col, Button, Space, Card } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CommonForm, { FormFieldConfig } from '../CommonForm';

export interface SearchFormProps {
  fields: FormFieldConfig[];
  onSearch?: (values: any) => void;
  onReset?: () => void;
  loading?: boolean;
  defaultCollapsed?: boolean;
  showCollapse?: boolean;
  columns?: number;
  initialValues?: any;
}

const SearchForm: React.FC<SearchFormProps> = ({
  fields,
  onSearch,
  onReset,
  loading = false,
  defaultCollapsed = true,
  showCollapse = true,
  columns = 3,
  initialValues = {}
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // 计算显示的字段数量
  const visibleFields = collapsed && showCollapse 
    ? fields.slice(0, columns - 1) // 预留一列给按钮
    : fields;

  const handleSearch = () => {
    form.validateFields().then(values => {
      if (onSearch) {
        onSearch(values);
      }
    });
  };

  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 添加操作按钮字段
  const actionField: FormFieldConfig = {
    name: 'actions',
    label: '',
    type: 'input',
    span: Math.floor(24 / columns),
    render: () => (
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            {t('common.search')}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            {t('common.reset')}
          </Button>
          {showCollapse && fields.length > columns - 1 && (
            <Button
              type="link"
              onClick={toggleCollapsed}
              style={{ padding: 0 }}
            >
              {collapsed ? t('common.expand') : t('common.collapse')}
              {collapsed ? <DownOutlined /> : <UpOutlined />}
            </Button>
          )}
        </Space>
      </Form.Item>
    )
  };

  const allFields = [...visibleFields, actionField];

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <CommonForm
        form={form}
        fields={allFields}
        columns={columns}
        initialValues={initialValues}
        layout="vertical"
      />
    </Card>
  );
};

export default SearchForm;