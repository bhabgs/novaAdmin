import React, { useEffect } from 'react';
import { Form, Input, Select, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createI18nTranslation,
  updateI18nTranslation,
  fetchI18nModules,
} from '@/store/slices/i18nSlice';
import { I18nTranslation, Language } from '@/types/i18n';

interface I18nFormProps {
  editingItem?: I18nTranslation | null;
  onSuccess?: () => void;
}

const I18nForm: React.FC<I18nFormProps> = ({ editingItem, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const { modules, loading } = useAppSelector(state => state.i18n);

  // Fetch modules on mount
  useEffect(() => {
    if (modules.length === 0) {
      dispatch(fetchI18nModules());
    }
  }, [dispatch, modules.length]);

  // Initialize form with editing item
  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue({
        language: editingItem.language,
        module: editingItem.module,
        key: editingItem.key,
        value: editingItem.value,
        remark: editingItem.remark,
      });
    } else {
      form.resetFields();
    }
  }, [editingItem, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // Update
        await dispatch(
          updateI18nTranslation({
            id: editingItem.id,
            dto: {
              language: values.language,
              module: values.module,
              key: values.key,
              value: values.value,
              remark: values.remark,
            },
          }),
        ).unwrap();
        message.success(t('message.updateSuccess'));
      } else {
        // Create
        await dispatch(
          createI18nTranslation({
            language: values.language,
            module: values.module,
            key: values.key,
            value: values.value,
            remark: values.remark,
          }),
        ).unwrap();
        message.success(t('message.addSuccess'));
      }

      onSuccess?.();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      }
    }
  };

  // Expose submit method via ref-like pattern
  useEffect(() => {
    const originalSubmit = form.submit;
    form.submit = handleSubmit;
    return () => {
      form.submit = originalSubmit;
    };
  }, [form, handleSubmit]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label={t('i18n.language')}
          name="language"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Select
            placeholder={t('i18n.selectLanguage')}
            disabled={!!editingItem}
            options={[
              { label: '中文 (Chinese)', value: 'zh-CN' as Language },
              { label: 'English', value: 'en-US' as Language },
              { label: 'العربية (Arabic)', value: 'ar-SA' as Language },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={t('i18n.module')}
          name="module"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Select
            placeholder={t('i18n.selectModule')}
            disabled={!!editingItem}
            allowClear
            options={modules.map(m => ({ label: m, value: m }))}
          />
        </Form.Item>

        <Form.Item
          label={t('i18n.key')}
          name="key"
          rules={[
            { required: true, message: t('message.required') },
            {
              pattern: /^[a-zA-Z0-9_\.]+$/,
              message: t('i18n.keyFormatError') || 'Key can only contain letters, numbers, dots and underscores',
            },
          ]}
        >
          <Input
            placeholder="e.g., appName, user.create"
            disabled={!!editingItem}
          />
        </Form.Item>

        <Form.Item
          label={t('i18n.value')}
          name="value"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Input.TextArea
            placeholder={t('i18n.valuePlaceholder') || 'Enter translation value (supports {{variable}} interpolation)'}
            rows={4}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={t('common.remark')}
          name="remark"
        >
          <Input.TextArea
            placeholder={t('message.optionalRemark')}
            rows={2}
            allowClear
          />
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default I18nForm;
