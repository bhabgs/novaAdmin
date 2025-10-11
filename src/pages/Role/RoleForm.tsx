import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { createRole, updateRole } from '../../store/slices/roleSlice';
import type { Role } from '../../types/role';

const { Option } = Select;
const { TextArea } = Input;

interface RoleFormProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  visible,
  role,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.role);

  useEffect(() => {
    if (visible) {
      if (role) {
        form.setFieldsValue({
          ...role,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, role, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (role) {
        await dispatch(updateRole({ id: role.id, ...values })).unwrap();
        message.success(t('role.updateSuccess'));
      } else {
        await dispatch(createRole(values)).unwrap();
        message.success(t('role.createSuccess'));
      }
      
      onSuccess();
    } catch (error) {
      message.error(t('message.error'));
    }
  };

  return (
    <Modal
      title={role ? t('role.editRole') : t('role.addRole')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t('role.roleName')}
              rules={[
                { required: true, message: t('role.roleNameRequired') },
                { min: 2, message: t('validation.minLength', { min: 2 }) },
                { max: 50, message: t('validation.maxLength', { max: 50 }) },
              ]}
            >
              <Input placeholder={t('role.roleNamePlaceholder')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label={t('role.roleCode')}
              rules={[
                { required: true, message: t('role.roleCodeRequired') },
                { min: 2, message: t('validation.minLength', { min: 2 }) },
                { max: 20, message: t('validation.maxLength', { max: 20 }) },
                { 
                  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, 
                  message: t('role.roleCodePattern') 
                },
              ]}
            >
              <Input 
                placeholder={t('role.roleCodePlaceholder')}
                disabled={role?.code === 'admin'} // 禁止修改管理员角色编码
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label={t('common.status')}
              rules={[
                { required: true, message: t('role.statusRequired') },
              ]}
            >
              <Select 
                placeholder={t('role.statusPlaceholder')}
                disabled={role?.code === 'admin'} // 禁止修改管理员角色状态
              >
                <Option value="active">{t('role.active')}</Option>
                <Option value="inactive">{t('role.inactive')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sort"
              label={t('role.sortOrder')}
              rules={[
                { type: 'number', message: t('role.sortOrderNumber') },
              ]}
            >
              <Input 
                type="number" 
                placeholder={t('role.sortOrderPlaceholder')}
                min={0}
                max={999}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={t('common.description')}
          rules={[
            { max: 200, message: t('validation.maxLength', { max: 200 }) },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t('role.descriptionPlaceholder')}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="remark"
          label={t('common.remark')}
          rules={[
            { max: 200, message: t('validation.maxLength', { max: 200 }) },
          ]}
        >
          <TextArea
            rows={3}
            placeholder={t('role.remarkPlaceholder')}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleForm;