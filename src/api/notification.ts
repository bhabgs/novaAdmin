import { get, post, put, del } from './request';
import type { ApiResponse, ListResponse } from '../types';
import type { Notification, NotificationListResponse } from '../types/notification';

// 获取通知列表
export const getNotifications = (params: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
} = {}): Promise<ApiResponse<NotificationListResponse>> => {
  return get<ApiResponse<NotificationListResponse>>('/notifications', { params });
};

// 获取未读通知数量
export const getUnreadCount = (): Promise<ApiResponse<{ count: number }>> => {
  return get<ApiResponse<{ count: number }>>('/notifications/unread-count');
};

// 标记通知为已读
export const markAsRead = (id: string): Promise<ApiResponse<null>> => {
  return put<ApiResponse<null>>(`/notifications/${id}/read`);
};

// 批量标记为已读
export const markAllAsRead = (): Promise<ApiResponse<null>> => {
  return post<ApiResponse<null>>('/notifications/mark-all-read');
};

// 删除通知
export const deleteNotification = (id: string): Promise<ApiResponse<null>> => {
  return del<ApiResponse<null>>(`/notifications/${id}`);
};

// 批量删除通知
export const batchDeleteNotifications = (ids: string[]): Promise<ApiResponse<null>> => {
  return post<ApiResponse<null>>('/notifications/batch-delete', { ids });
};

export const notificationApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  batchDeleteNotifications,
};

