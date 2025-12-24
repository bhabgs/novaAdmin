import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Space,
  message,
  Modal,
  Divider,
  Descriptions,
  Tag,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  LockOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { changePassword } from '@/store/slices/authSlice';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 更新个人资料
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const values = await profileForm.validateFields();
      // TODO: 实现updateProfile功能
      // await dispatch(updateProfile(values)).unwrap();
      message.success(t('settings.profileUpdateSuccess'));
    } catch (error) {
      message.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handlePasswordChange = async () => {
    try {
      setLoading(true);
      const values = await passwordForm.validateFields();
      await dispatch(changePassword(values)).unwrap();
      message.success(t('settings.passwordChangeSuccess'));
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  // 头像上传
  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(t('user.avatarUploadSuccess'));
      // 更新用户头像
      // TODO: 实现updateProfile功能
      // dispatch(updateProfile({ avatar: info.file.response.url }));
    } else if (info.file.status === 'error') {
      message.error(t('user.avatarUploadError'));
    }
  };

  return (
    <PageContainer title={t('settings.profile')} ghost>
      <Row gutter={[24, 24]}>
        {/* 个人信息卡片 */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                action="/api/upload/avatar"
                onChange={handleAvatarUpload}
              >
                <Avatar
                  size={120}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
              </Upload>
              <div style={{ marginTop: 16 }}>
                <Button icon={<UploadOutlined />} size="small">
                  {t('user.uploadAvatar')}
                </Button>
              </div>
              <Title level={4} style={{ marginTop: 24, marginBottom: 8 }}>
                {user?.name || user?.username}
              </Title>
              <Text type="secondary">{user?.email}</Text>
              <Divider />
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined />
                      {t('user.username')}
                    </Space>
                  }
                >
                  {user?.username}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <MailOutlined />
                      {t('user.email')}
                    </Space>
                  }
                >
                  {user?.email}
                </Descriptions.Item>
                {user?.phone && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        {t('user.phone')}
                      </Space>
                    }
                  >
                    {user.phone}
                  </Descriptions.Item>
                )}
                {user?.createTime && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <CalendarOutlined />
                        {t('user.createTime')}
                      </Space>
                    }
                  >
                    {user.createTime}
                  </Descriptions.Item>
                )}
              </Descriptions>
              <Divider />
              <div style={{ textAlign: 'left' }}>
                <Text type="secondary">{t('user.roles')}</Text>
                <div style={{ marginTop: 8 }}>
                  {user?.roles?.map((role) => (
                    <Tag key={role.id} color="blue" style={{ marginBottom: 4 }}>
                      {role.name}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 编辑个人资料 */}
        <Col xs={24} lg={16}>
          <Card title={t('settings.editProfile')}>
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                username: user?.username,
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label={t('user.username')}
                    rules={[{ required: true, message: t('user.usernameRequired') }]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label={t('user.name')}
                    rules={[{ required: true, message: t('user.nameRequired') }]}
                  >
                    <Input placeholder={t('user.namePlaceholder')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={t('user.email')}
                    rules={[
                      { required: true, message: t('user.emailRequired') },
                      { type: 'email', message: t('validation.email') },
                    ]}
                  >
                    <Input placeholder={t('user.emailPlaceholder')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label={t('user.phone')}
                    rules={[
                      {
                        pattern: /^1[3-9]\d{9}$/,
                        message: t('validation.phone'),
                      },
                    ]}
                  >
                    <Input placeholder={t('user.phonePlaceholder')} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Col>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setIsPasswordModalVisible(true)}
                  >
                    {t('settings.changePassword')}
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleProfileUpdate}
                  >
                    {t('common.save')}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 修改密码弹窗 */}
      <Modal
        title={t('settings.changePassword')}
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsPasswordModalVisible(false)}>
            {t('common.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handlePasswordChange}
          >
            {t('common.confirm')}
          </Button>,
        ]}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label={t('settings.oldPassword')}
            rules={[{ required: true, message: t('settings.oldPasswordRequired') }]}
          >
            <Input.Password placeholder={t('settings.oldPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t('settings.newPassword')}
            rules={[
              { required: true, message: t('settings.newPasswordRequired') },
              { min: 6, message: t('validation.minLength', { min: 6 }) },
            ]}
          >
            <Input.Password placeholder={t('settings.newPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('settings.confirmPassword')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('user.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('validation.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('user.confirmPasswordPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Profile;
