import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationApi } from '../../api/notification';
import type { NotificationState, Notification } from '../../types/notification';

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

// 获取通知列表
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params: { page?: number; pageSize?: number; type?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取通知列表失败');
    }
  }
);

// 获取未读数量
export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.success) {
        return response.data.count;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取未读数量失败');
    }
  }
);

// 标记为已读
export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAsRead(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '标记失败');
    }
  }
);

// 全部标记为已读
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '标记失败');
    }
  }
);

// 删除通知
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationApi.deleteNotification(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '删除失败');
    }
  }
);

// 批量删除通知
export const batchDeleteNotifications = createAsyncThunk(
  'notification/batchDelete',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await notificationApi.batchDeleteNotifications(ids);
      if (response.success) {
        return ids;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '批量删除失败');
    }
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
        // Calculate unread count from the list
        state.unreadCount = action.payload.list.filter((n) => n.status === 'unread').length;
        state.pagination = {
          page: action.payload.pagination.page,
          pageSize: action.payload.pagination.pageSize,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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

