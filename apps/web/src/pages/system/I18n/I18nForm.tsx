import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Select, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createI18nTranslation,
  updateI18nTranslation,
  fetchI18nModules,
  type I18nTranslation,
} from '@/store/slices/i18nSlice';

export interface I18nFormRef {
  submit: () => Promise<void>;
}

interface I18nFormProps {
  editingItem?: I18nTranslation | null;
  onSuccess?: () => void;
}

const I18nForm = forwardRef<I18nFormRef, I18nFormProps>(({ editingItem, onSuccess }, ref) => {
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
        module: editingItem.module,
        key: editingItem.key,
        zhCN: editingItem.zhCN,
        enUS: editingItem.enUS,
        arSA: editingItem.arSA,
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
              module: values.module,
              key: values.key,
              zhCN: values.zhCN,
              enUS: values.enUS,
              arSA: values.arSA,
              remark: values.remark,
            },
          }),
        ).unwrap();
        message.success(t('message.updateSuccess'));
      } else {
        // Create
        await dispatch(
          createI18nTranslation({
            module: values.module,
            key: values.key,
            zhCN: values.zhCN,
            enUS: values.enUS,
            arSA: values.arSA,
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

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label={t('i18n.module')}
          name="module"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Select
            placeholder={t('i18n.selectModule')}
            disabled={!!editingItem}
            allowClear
            showSearch
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
          label="中文翻译 (Chinese)"
          name="zhCN"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Input.TextArea
            placeholder="输入中文翻译（支持 {{variable}} 插值）"
            rows={3}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="英文翻译 (English)"
          name="enUS"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Input.TextArea
            placeholder="Enter English translation (supports {{variable}} interpolation)"
            rows={3}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="阿拉伯语翻译 (Arabic)"
          name="arSA"
          rules={[{ required: true, message: t('message.required') }]}
        >
          <Input.TextArea
            placeholder="أدخل الترجمة العربية (يدعم {{variable}} الاستيفاء)"
            rows={3}
            allowClear
            dir="rtl"
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
});

I18nForm.displayName = 'I18nForm';

export default I18nForm;
