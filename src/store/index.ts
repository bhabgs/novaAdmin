import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// 导入所有的slice
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import menuReducer from './slices/menuSlice';
import dashboardReducer from './slices/dashboardSlice';
import tabsReducer from './slices/tabsSlice';
import notificationReducer from './slices/notificationSlice';

// 配置store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    user: userReducer,
    role: roleReducer,
    menu: menuReducer,
    dashboard: dashboardReducer,
    tabs: tabsReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些action types的序列化检查
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出类型化的hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 导出store
export default store;