import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CodeModule } from './types';

interface ModuleFormProps {
  visible: boolean;
  module: CodeModule | null;
  onSubmit: (values: Partial<CodeModule>) => void;
  onCancel: () => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  visible,
  module,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (module) {
        form.setFieldsValue(module);
      } else {
        form.resetFields();
      }
    }
  }, [visible, module, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      message.error(t('codeGen.formError'));
    }
  };

  return (
    <Modal
      title={module ? t('codeGen.editModule') : t('codeGen.addModule')}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '',
          moduleName: '',
          description: '',
        }}
      >
        <Form.Item
          name="name"
          label={t('codeGen.moduleName')}
          rules={[
            { required: true, message: t('codeGen.moduleNameRequired') },
          ]}
        >
          <Input placeholder={t('codeGen.moduleNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="moduleName"
          label={t('codeGen.moduleCode')}
          rules={[
            { required: true, message: t('codeGen.moduleCodeRequired') },
            {
              pattern: /^[a-z][a-zA-Z0-9]*$/,
              message: t('codeGen.moduleCodePattern'),
            },
          ]}
        >
          <Input placeholder={t('codeGen.moduleCodePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('common.description')}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('codeGen.descriptionPlaceholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModuleForm;
