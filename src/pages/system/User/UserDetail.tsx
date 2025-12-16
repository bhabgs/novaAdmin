import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Avatar,
  Tag,
  Button,
  Space,
  Spin,
  Row,
  Col,
  Statistic,
  Timeline,
  Table,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUserById } from '@/store/slices/userSlice';
import type { User } from '@/types/user';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentUser, loading } = useAppSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        {t('message.dataNotFound')}
      </div>
    );
  }

  const statusConfig = {
    active: { color: 'green', text: t('user.active') },
    inactive: { color: 'orange', text: t('user.inactive') },
    banned: { color: 'red', text: t('user.banned') },
  };

  const status = statusConfig[currentUser.status as keyof typeof statusConfig];

  // 模拟用户活动日志
  const activityLogs = [
    {
      time: '2024-01-15 10:30:00',
      action: t('user.loginAction'),
      ip: '192.168.1.100',
    },
    {
      time: '2024-01-14 16:45:00',
      action: t('user.updateProfileAction'),
      ip: '192.168.1.100',
    },
    {
      time: '2024-01-14 09:15:00',
      action: t('user.loginAction'),
      ip: '192.168.1.100',
    },
  ];

  const activityColumns = [
    {
      title: t('user.actionTime'),
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: t('user.action'),
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: t('user.ipAddress'),
      dataIndex: 'ip',
      key: 'ip',
    },
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            {t('common.back')}
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/edit/${id}`)}
          >
            {t('common.edit')}
          </Button>
        </Space>

        <Row gutter={24}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={120}
                  src={currentUser.avatar}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <h2>{currentUser.name}</h2>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  @{currentUser.username}
                </p>
                <Tag color={status.color} style={{ marginBottom: 16 }}>
                  {status.text}
                </Tag>
                
                <div style={{ textAlign: 'left', marginTop: 24 }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      {currentUser.email}
                    </div>
                    {currentUser.phone && (
                      <div>
                        <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        {currentUser.phone}
                      </div>
                    )}
                    <div>
                      <CalendarOutlined style={{ marginRight: 8, color: '#faad14' }} />
                      {t('user.joinTime')}: {currentUser.createTime}
                    </div>
                  </Space>
                </div>
              </div>
            </Card>

            <Card title={t('user.statistics')} style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={t('user.loginCount')}
                    value={156}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('user.onlineDuration')}
                    value="24h"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={16}>
            <Card
              tabList={[
                { key: 'basic', tab: t('user.basicInfo') },
                { key: 'roles', tab: t('user.roleInfo') },
                { key: 'activity', tab: t('user.activityLog') },
              ]}
              activeTabKey={activeTab}
              onTabChange={setActiveTab}
            >
              {activeTab === 'basic' && (
                <Descriptions column={2} bordered>
                  <Descriptions.Item label={t('user.username')}>
                    {currentUser.username}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('user.name')}>
                    {currentUser.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('user.email')}>
                    {currentUser.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('user.phone')}>
                    {currentUser.phone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('user.status')}>
                    <Tag color={status.color}>{status.text}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('user.lastLoginTime')}>
                    {currentUser.lastLoginTime || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('common.createTime')}>
                    {currentUser.createTime}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('common.updateTime')}>
                    {currentUser.updateTime}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('common.remark')} span={2}>
                    {currentUser.remark || '-'}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {activeTab === 'roles' && (
                <div>
                  <h4>{t('user.assignedRoles')}</h4>
                  <Space wrap style={{ marginBottom: 16 }}>
                    {currentUser.roles?.map((role) => (
                      <Tag key={role} color="blue" style={{ padding: '4px 8px' }}>
                        {role}
                      </Tag>
                    ))}
                  </Space>
                  
                  <h4>{t('user.permissions')}</h4>
                  <Timeline>
                    <Timeline.Item color="green">
                      {t('user.userManagementPermission')}
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      {t('user.roleManagementPermission')}
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      {t('user.systemSettingsPermission')}
                    </Timeline.Item>
                  </Timeline>
                </div>
              )}

              {activeTab === 'activity' && (
                <Table
                  columns={activityColumns}
                  dataSource={activityLogs}
                  rowKey="time"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserDetail;