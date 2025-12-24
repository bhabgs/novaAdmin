import { Notification, ApiResponse, ListResponse } from '../types';
import { mockNotifications, getUnreadCount } from '@/data/notification';

// 本地通知列表
let localNotifications: Notification[] = JSON.parse(JSON.stringify(mockNotifications));

// 通知相关API - 使用本地假数据
export const notificationApi = {
  // 获取通知列表
  getNotifications: (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<ListResponse<Notification>>> => {
    const { page = 1, pageSize = 10, type = '', status = '' } = params || {};

    let filteredNotifications = [...localNotifications];

    if (type) {
      filteredNotifications = filteredNotifications.filter((n) => n.type === type);
    }

    if (status) {
      filteredNotifications = filteredNotifications.filter((n) => n.status === status);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredNotifications.slice(start, end);

    return Promise.resolve({
      success: true,
      data: {
        list,
        pagination: { page, pageSize, total: filteredNotifications.length },
      },
      message: '获取成功',
    });
  },

  // 获取未读通知数
  getUnreadCount: (): Promise<ApiResponse<{ count: number }>> => {
    const count = localNotifications.filter((n) => n.status === 'unread').length;

    return Promise.resolve({
      success: true,
      data: { count },
      message: '获取成功',
    });
  },

  // 标记为已读
  markAsRead: (id: string): Promise<ApiResponse<null>> => {
    const notification = localNotifications.find((n) => n.id === id);

    if (notification) {
      notification.status = 'read';
      notification.readTime = new Date().toISOString();
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '已标记为已读',
    });
  },

  // 全部标记为已读
  markAllAsRead: (): Promise<ApiResponse<null>> => {
    localNotifications.forEach((n) => {
      if (n.status === 'unread') {
        n.status = 'read';
        n.readTime = new Date().toISOString();
      }
    });

    return Promise.resolve({
      success: true,
      data: null,
      message: '全部已标记为已读',
    });
  },

  // 删除通知
  deleteNotification: (id: string): Promise<ApiResponse<null>> => {
    const index = localNotifications.findIndex((n) => n.id === id);

    if (index > -1) {
      localNotifications.splice(index, 1);
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 批量删除通知
  batchDeleteNotifications: (ids: string[]): Promise<ApiResponse<null>> => {
    localNotifications = localNotifications.filter((n) => !ids.includes(n.id));

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },
};
