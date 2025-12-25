import { LoginRequest, LoginResponse, ApiResponse, User } from '../types';
import { authAPI } from './generatedAPI';

// 认证相关API - 使用自动生成的 API 并添加类型适配
export const authApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return authAPI.login(data) as unknown as Promise<ApiResponse<LoginResponse>>;
  },

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    return authAPI.logout() as unknown as Promise<ApiResponse<null>>;
  },

  // 刷新token
  refreshToken: (): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    return authAPI.refreshToken() as unknown as Promise<ApiResponse<{ token: string; refreshToken: string }>>;
  },

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> => {
    return authAPI.getUserInfo() as unknown as Promise<ApiResponse<User>>;
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> => {
    return authAPI.changePassword(data) as unknown as Promise<ApiResponse<null>>;
  },

  // 重置密码
  resetPassword: (data: { email: string }): Promise<ApiResponse<null>> => {
    return authAPI.resetPassword(data) as unknown as Promise<ApiResponse<null>>;
  },

  // 验证token
  verifyToken: (): Promise<ApiResponse<{ valid: boolean }>> => {
    return authAPI.verifyToken() as unknown as Promise<ApiResponse<{ valid: boolean }>>;
  },
};
