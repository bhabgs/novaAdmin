// 通知类型
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// 通知状态
export type NotificationStatus = 'unread' | 'read';

// 通知接口
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  createTime: string;
  readTime?: string;
  link?: string;
  icon?: string;
  avatar?: string;
  sender?: string;
}

// 通知列表响应
export interface NotificationListResponse {
  list: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  unreadCount: number;
}

// 通知状态
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

