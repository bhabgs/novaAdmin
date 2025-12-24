import { LoginRequest, LoginResponse, ApiResponse, User } from '../types';
import { mockAuthUsers, generateToken } from '@/data/auth';

// 本地存储的当前用户和token
let currentUser: User | null = null;
let currentToken: string | null = null;

// 认证相关API - 使用本地假数据
export const authApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const { username, password } = data;

    // 验证用户名和密码
    const user = mockAuthUsers.find((u) => u.username === username);

    if (!user) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '用户不存在',
        code: 404,
      });
    }

    // 简单的密码验证（实际项目中应该使用加密）
    if (password !== user.password) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '密码错误',
        code: 401,
      });
    }

    if (user.status !== 'active') {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '账户已被禁用',
        code: 403,
      });
    }

    // 生成token
    const { token, refreshToken } = generateToken(user.id);
    currentToken = token;
    currentUser = user as User;

    return Promise.resolve({
      success: true,
      data: {
        token,
        refreshToken,
        user: user as User,
        expiresIn: 7200, // 2小时
      },
      message: '登录成功',
    });
  },

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    currentToken = null;
    currentUser = null;

    return Promise.resolve({
      success: true,
      data: null,
      message: '登出成功',
    });
  },

  // 刷新token
  refreshToken: (): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    const { token, refreshToken } = generateToken(currentUser?.id || '1');

    return Promise.resolve({
      success: true,
      data: {
        token,
        refreshToken,
      },
      message: 'Token已刷新',
    });
  },

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> => {
    if (!currentUser) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '用户未登录',
        code: 401,
      });
    }

    return Promise.resolve({
      success: true,
      data: currentUser,
      message: '获取成功',
    });
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> => {
    return Promise.resolve({
      success: true,
      data: null,
      message: '密码已修改',
    });
  },

  // 重置密码
  resetPassword: (data: { email: string }): Promise<ApiResponse<null>> => {
    return Promise.resolve({
      success: true,
      data: null,
      message: '重置密码邮件已发送',
    });
  },

  // 验证token
  verifyToken: (): Promise<ApiResponse<{ valid: boolean }>> => {
    return Promise.resolve({
      success: true,
      data: {
        valid: !!currentToken,
      },
      message: '',
    });
  },
};