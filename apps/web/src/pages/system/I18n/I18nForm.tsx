import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
} from "antd";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { createI18n, updateI18n } from "@/store/slices/i18nSlice";
import { fetchI18nModules } from "@/store/slices/i18nModuleSlice";
import type { I18n } from "@/types/i18n";

const { Option } = Select;

interface I18nFormProps {
  visible: boolean;
  i18n: I18n | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const I18nForm: React.FC<I18nFormProps> = ({
  visible,
  i18n,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.i18n);
  const { items: modules } = useAppSelector((state) => state.i18nModule);

  useEffect(() => {
    if (visible) {
      dispatch(fetchI18nModules({ page: 1, pageSize: 100 }));
      if (i18n) {
        form.setFieldsValue(i18n);
      } else {
        form.resetFields();
      }
    }
  }, [visible, i18n, form, dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (i18n) {
        await dispatch(updateI18n({ id: i18n.id, data: values })).unwrap();
        message.success(t("i18n.updateSuccess"));
      } else {
        await dispatch(createI18n(values)).unwrap();
        message.success(t("i18n.createSuccess"));
      }

      onSuccess();
    } catch {
      message.error(t("message.error"));
    }
  };

  return (
    <Modal
      title={i18n ? t("i18n.editI18n") : t("i18n.addI18n")}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="moduleId"
              label={t("i18n.module")}
              rules={[
                { required: true, message: t("i18n.moduleRequired") },
              ]}
            >
              <Select
                placeholder={t("i18n.selectModule")}
                disabled={!!i18n}
              >
                {modules.map((module) => (
                  <Option key={module.id} value={module.id}>
                    {module.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="key"
              label={t("i18n.key")}
              rules={[
                { required: true, message: t("i18n.keyRequired") },
                { max: 100, message: t("validation.maxLength", { max: 100 }) },
              ]}
            >
              <Input placeholder={t("i18n.keyPlaceholder")} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="zhCn"
              label={t("i18n.zhCn")}
              rules={[
                { required: true, message: t("i18n.zhCnRequired") },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder={t("i18n.zhCnPlaceholder")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="enUs"
              label={t("i18n.enUs")}
              rules={[
                { required: true, message: t("i18n.enUsRequired") },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder={t("i18n.enUsPlaceholder")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="arSa"
              label={t("i18n.arSa")}
              rules={[
                { required: true, message: t("i18n.arSaRequired") },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder={t("i18n.arSaPlaceholder")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remark" label={t("common.remark")}>
          <Input.TextArea
            rows={3}
            placeholder={t("i18n.remarkPlaceholder")}
            maxLength={255}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default I18nForm;

