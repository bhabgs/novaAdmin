import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Avatar,
  message,
  Row,
  Col,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { createUser, updateUser } from "@/store/slices/userSlice";
import { fetchRoles } from "@/store/slices/roleSlice";
import type { User } from "@/types/user";

const { Option } = Select;

interface UserFormProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  user,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);
  const { roles } = useAppSelector((state) => state.role);

  useEffect(() => {
    if (visible) {
      dispatch(fetchRoles({ page: 1, pageSize: 100 }));
      if (user) {
        form.setFieldsValue({
          ...user,
          roles: user.roles || [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, user, form, dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (user) {
        await dispatch(updateUser({ id: user.id, ...values })).unwrap();
        message.success(t("user.updateSuccess"));
      } else {
        await dispatch(createUser(values)).unwrap();
        message.success(t("user.createSuccess"));
      }

      onSuccess();
    } catch {
      message.error(t("message.error"));
    }
  };

  const handleUpload = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === "done") {
      // 这里应该处理文件上传逻辑
      // 上传成功后，更新表单中的 avatar 字段
      if (info.file.response?.url) {
        form.setFieldsValue({ avatar: info.file.response.url });
      }
      message.success(t("user.avatarUploadSuccess"));
    } else if (info.file.status === "error") {
      message.error(t("user.avatarUploadError"));
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t("user.uploadAvatar")}</div>
    </div>
  );

  return (
    <Modal
      title={user ? t("user.editUser") : t("user.addUser")}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="avatar" label={t("user.avatar")}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action="/api/upload"
                onChange={handleUpload}
              >
                {form.getFieldValue("avatar") ? (
                  <Avatar
                    size={80}
                    src={form.getFieldValue("avatar")}
                    icon={<UserOutlined />}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label={t("user.username")}
              rules={[
                { required: true, message: t("user.usernameRequired") },
                { min: 3, message: t("validation.minLength", { min: 3 }) },
                { max: 20, message: t("validation.maxLength", { max: 20 }) },
              ]}
            >
              <Input placeholder={t("user.usernamePlaceholder")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t("user.name")}
              rules={[
                { required: true, message: t("user.nameRequired") },
                { max: 50, message: t("validation.maxLength", { max: 50 }) },
              ]}
            >
              <Input placeholder={t("user.namePlaceholder")} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={t("user.email")}
              rules={[
                { required: true, message: t("user.emailRequired") },
                { type: "email", message: t("validation.email") },
              ]}
            >
              <Input placeholder={t("user.emailPlaceholder")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={t("user.phone")}
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: t("validation.phone") },
              ]}
            >
              <Input placeholder={t("user.phonePlaceholder")} />
            </Form.Item>
          </Col>
        </Row>

        {!user && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label={t("user.password")}
                rules={[
                  { required: true, message: t("user.passwordRequired") },
                  { min: 6, message: t("validation.minLength", { min: 6 }) },
                ]}
              >
                <Input.Password placeholder={t("user.passwordPlaceholder")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label={t("user.confirmPassword")}
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: t("user.confirmPasswordRequired"),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(t("validation.passwordMismatch"))
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder={t("user.confirmPasswordPlaceholder")}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="roles"
              label={t("user.roles")}
              rules={[{ required: true, message: t("user.rolesRequired") }]}
            >
              <Select
                mode="multiple"
                placeholder={t("user.rolesPlaceholder")}
                allowClear
              >
                {roles.map((role) => (
                  <Option key={role.id} value={role.code}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label={t("user.status")}
              rules={[{ required: true, message: t("user.statusRequired") }]}
            >
              <Select placeholder={t("user.statusPlaceholder")}>
                <Option value="active">{t("user.active")}</Option>
                <Option value="inactive">{t("user.inactive")}</Option>
                <Option value="banned">{t("user.banned")}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="remark" label={t("common.remark")}>
          <Input.TextArea
            rows={3}
            placeholder={t("user.remarkPlaceholder")}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
