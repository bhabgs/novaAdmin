import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { NotificationState, Notification } from '../../types/notification';
import { mockNotifications, getUnreadCount } from '../../data/notification';

// 本地数据存储（模拟后端状态）
let localNotifications = [...mockNotifications];

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

// 获取通知列表（使用本地模拟数据）
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params: { page?: number; pageSize?: number; type?: string; status?: string } = {}) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const { page = 1, pageSize = 10, type, status } = params;

    let filtered = [...localNotifications];
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    if (status) {
      filtered = filtered.filter(n => n.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return {
      list,
      pagination: { page, pageSize, total },
    };
  }
);

// 获取未读数量
export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return localNotifications.filter(n => n.status === 'unread').length;
  }
);

// 标记为已读
export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const notification = localNotifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'read';
      notification.readTime = new Date().toISOString();
    }
    return id;
  }
);

// 全部标记为已读
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    localNotifications.forEach(n => {
      if (n.status === 'unread') {
        n.status = 'read';
        n.readTime = new Date().toISOString();
      }
    });
    return true;
  }
);

// 删除通知
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    localNotifications = localNotifications.filter(n => n.id !== id);
    return id;
  }
);

// 批量删除通知
export const batchDeleteNotifications = createAsyncThunk(
  'notification/batchDelete',
  async (ids: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    localNotifications = localNotifications.filter(n => !ids.includes(n.id));
    return ids;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取通知列表
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.list;
        state.unreadCount = action.payload.list.filter((n) => n.status === 'unread').length;
        state.pagination = {
          page: action.payload.pagination.page,
          pageSize: action.payload.pagination.pageSize,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取通知列表失败';
      });

    // 获取未读数量
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // 标记为已读
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && notification.status === 'unread') {
          notification.status = 'read';
          notification.readTime = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // 全部标记为已读
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          if (notification.status === 'unread') {
            notification.status = 'read';
            notification.readTime = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      });

    // 删除通知
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (notification.status === 'unread') {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      });

    // 批量删除通知
    builder
      .addCase(batchDeleteNotifications.fulfilled, (state, action) => {
        const deletedIds = action.payload;
        const deletedCount = state.notifications.filter((n) => deletedIds.includes(n.id) && n.status === 'unread').length;
        state.notifications = state.notifications.filter((n) => !deletedIds.includes(n.id));
        state.unreadCount = Math.max(0, state.unreadCount - deletedCount);
        state.pagination.total = Math.max(0, state.pagination.total - deletedIds.length);
      });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
