import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { createI18nModule, updateI18nModule } from "@/store/slices/i18nModuleSlice";
import type { I18nModule } from "@/types/i18n";

interface I18nModuleFormProps {
  visible: boolean;
  module: I18nModule | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const I18nModuleForm: React.FC<I18nModuleFormProps> = ({
  visible,
  module,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.i18nModule);

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

      if (module) {
        await dispatch(updateI18nModule({ id: module.id, data: values })).unwrap();
        message.success(t("i18nModule.updateSuccess"));
      } else {
        await dispatch(createI18nModule(values)).unwrap();
        message.success(t("i18nModule.createSuccess"));
      }

      onSuccess();
    } catch {
      message.error(t("message.error"));
    }
  };

  return (
    <Modal
      title={module ? t("i18nModule.editModule") : t("i18nModule.addModule")}
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
      >
        <Form.Item
          name="code"
          label={t("i18nModule.code")}
          rules={[
            { required: true, message: t("i18nModule.codeRequired") },
            { max: 50, message: t("validation.maxLength", { max: 50 }) },
          ]}
        >
          <Input 
            placeholder={t("i18nModule.codePlaceholder")} 
            disabled={!!module}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={t("i18nModule.name")}
          rules={[
            { required: true, message: t("i18nModule.nameRequired") },
            { max: 100, message: t("validation.maxLength", { max: 100 }) },
          ]}
        >
          <Input placeholder={t("i18nModule.namePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("i18nModule.description")}
          rules={[
            { max: 255, message: t("validation.maxLength", { max: 255 }) },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder={t("i18nModule.descriptionPlaceholder")}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item name="remark" label={t("common.remark")}>
          <Input.TextArea
            rows={3}
            placeholder={t("i18nModule.remarkPlaceholder")}
            maxLength={255}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default I18nModuleForm;

