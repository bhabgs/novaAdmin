import { post, get } from './request';
import { LoginRequest, LoginResponse, ApiResponse, User } from '../types';

// 认证相关API
export const authApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return post('/auth/login', data);
  },

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    return post('/auth/logout');
  },

  // 刷新token
  refreshToken: (): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    return post('/auth/refresh');
  },

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> => {
    return get('/auth/userinfo');
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> => {
    return post('/auth/change-password', data);
  },

  // 重置密码
  resetPassword: (data: {
    email: string;
  }): Promise<ApiResponse<null>> => {
    return post('/auth/reset-password', data);
  },

  // 验证token
  verifyToken: (): Promise<ApiResponse<{ valid: boolean }>> => {
    return get('/auth/verify');
  },
};