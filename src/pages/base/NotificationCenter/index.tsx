import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  List,
  Badge,
  Tag,
  Button,
  Space,
  Empty,
  Popconfirm,
  Typography,
  Segmented,
  Spin,
  message,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  batchDeleteNotifications,
} from '@/store/slices/notificationSlice';
import PageContainer from '@/components/PageContainer';
import type { Notification, NotificationType } from '@/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ar';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

// 通知类型图标映射
const typeIconMap: Record<NotificationType, React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  system: <BellOutlined style={{ color: '#722ed1' }} />,
};

// 通知类型标签颜色映射
const typeColorMap: Record<NotificationType, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
  system: 'purple',
};

const NotificationCenter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, pagination } = useAppSelector(
    (state) => state.notification
  );

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 加载通知列表
  useEffect(() => {
    dispatch(
      fetchNotifications({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })
    );
  }, [dispatch, pagination.page, pagination.pageSize, filterType, filterStatus]);

  // 加载未读数量
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // 格式化时间
  const formatTime = (timeString: string) => {
    try {
      const locale = i18n.language === 'zh-CN' ? 'zh-cn' : i18n.language === 'ar-SA' ? 'ar' : 'en';
      return dayjs(timeString).locale(locale).fromNow();
    } catch {
      return timeString;
    }
  };

  // 标记为已读
  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      message.success(t('notification.markAsReadSuccess'));
      // 刷新未读数量
      dispatch(fetchUnreadCount());
    } catch (error) {
      message.error(t('notification.markAsReadError'));
    }
  };

  // 全部标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      message.success(t('notification.markAllAsReadSuccess'));
      // 刷新列表和未读数量
      dispatch(fetchUnreadCount());
      dispatch(
        fetchNotifications({
          page: pagination.page,
          pageSize: pagination.pageSize,
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        })
      );
    } catch (error) {
      message.error(t('notification.markAllAsReadError'));
    }
  };

  // 删除通知
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      message.success(t('notification.deleteSuccess'));
      // 刷新列表
      dispatch(
        fetchNotifications({
          page: pagination.page,
          pageSize: pagination.pageSize,
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        })
      );
      dispatch(fetchUnreadCount());
    } catch (error) {
      message.error(t('notification.deleteError'));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      message.warning(t('notification.selectWarning'));
      return;
    }
    try {
      await dispatch(batchDeleteNotifications(selectedIds)).unwrap();
      message.success(t('notification.batchDeleteSuccess'));
      setSelectedIds([]);
      // 刷新列表
      dispatch(
        fetchNotifications({
          page: pagination.page,
          pageSize: pagination.pageSize,
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        })
      );
      dispatch(fetchUnreadCount());
    } catch (error) {
      message.error(t('notification.batchDeleteError'));
    }
  };

  // 刷新
  const handleRefresh = () => {
    dispatch(
      fetchNotifications({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })
    );
    dispatch(fetchUnreadCount());
  };

  // 切换选择
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(
      fetchNotifications({
        page,
        pageSize: pageSize || pagination.pageSize,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })
    );
  };

  // 过滤后的通知列表
  const filteredNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  return (
    <PageContainer
      title={
        <Space>
          <BellOutlined />
          {t('notification.title')}
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />
          )}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title={t('notification.refresh')}>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
          </Tooltip>
          {unreadCount > 0 && (
            <Popconfirm
              title={t('notification.markAllAsReadConfirm')}
              onConfirm={handleMarkAllAsRead}
              okText={t('common.confirm')}
              cancelText={t('common.cancel')}
            >
              <Button icon={<CheckOutlined />} type="primary">
                {t('notification.markAllAsRead')}
              </Button>
            </Popconfirm>
          )}
          {selectedIds.length > 0 && (
            <Popconfirm
              title={t('notification.batchDeleteConfirm', { count: selectedIds.length })}
              onConfirm={handleBatchDelete}
              okText={t('common.confirm')}
              cancelText={t('common.cancel')}
            >
              <Button icon={<DeleteOutlined />} danger>
                {t('notification.batchDelete')} ({selectedIds.length})
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Card>
        {/* 筛选器 */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="large">
          <Space>
            <Text strong>{t('notification.filterByType')}:</Text>
            <Segmented
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: t('notification.all'), value: 'all' },
                { label: t('notification.typeInfo'), value: 'info' },
                { label: t('notification.typeSuccess'), value: 'success' },
                { label: t('notification.typeWarning'), value: 'warning' },
                { label: t('notification.typeError'), value: 'error' },
                { label: t('notification.typeSystem'), value: 'system' },
              ]}
            />
          </Space>
          <Space>
            <Text strong>{t('notification.filterByStatus')}:</Text>
            <Segmented
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: t('notification.all'), value: 'all' },
                { label: t('notification.unread'), value: 'unread' },
                { label: t('notification.read'), value: 'read' },
              ]}
            />
          </Space>
        </Space>

        {/* 通知列表 */}
        <Spin spinning={loading}>
          {filteredNotifications.length === 0 ? (
            <Empty description={t('notification.noNotifications')} />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={filteredNotifications}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => t('notification.total', { total }),
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
              renderItem={(item: Notification) => (
                <List.Item
                  style={{
                    backgroundColor: item.status === 'unread' ? '#f0f7ff' : 'transparent',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: item.status === 'unread' ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  }}
                  actions={[
                    <Space key="actions">
                      {item.status === 'unread' && (
                        <Tooltip title={t('notification.markAsRead')}>
                          <Button
                            type="text"
                            icon={<CheckOutlined />}
                            onClick={() => handleMarkAsRead(item.id)}
                          />
                        </Tooltip>
                      )}
                      <Popconfirm
                        key="delete"
                        title={t('notification.deleteConfirm')}
                        onConfirm={() => handleDelete(item.id)}
                        okText={t('common.confirm')}
                        cancelText={t('common.cancel')}
                      >
                        <Tooltip title={t('notification.delete')}>
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                      </Popconfirm>
                    </Space>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={item.status === 'unread'}>
                        <div style={{ fontSize: '24px' }}>{typeIconMap[item.type]}</div>
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={item.status === 'unread'}>{item.title}</Text>
                        <Tag color={typeColorMap[item.type]}>
                          {t(`notification.type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                        </Tag>
                        {item.status === 'unread' && (
                          <Tag color="blue">{t('notification.unread')}</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: true, symbol: t('notification.more') }}
                          style={{ marginBottom: '8px' }}
                        >
                          {item.content}
                        </Paragraph>
                        <Space size="small">
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatTime(item.createTime)}
                          </Text>
                          {item.sender && (
                            <>
                              <Text type="secondary">•</Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {t('notification.sender')}: {item.sender}
                              </Text>
                            </>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </PageContainer>
  );
};

export default NotificationCenter;

