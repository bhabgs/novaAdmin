import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import departmentReducer from './slices/departmentSlice';
import menuReducer from './slices/menuSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    role: roleReducer,
    department: departmentReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
