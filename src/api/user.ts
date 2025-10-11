import { get, post, put, del } from './request';
import { User, ApiResponse, ListResponse, PaginationParams } from '../types';

// 用户管理相关API
export const userApi = {
  // 获取用户列表
  getUsers: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    role?: string;
  }): Promise<ApiResponse<ListResponse<User>>> => {
    return get('/users', { params });
  },

  // 获取用户详情
  getUserById: (id: string): Promise<ApiResponse<User>> => {
    return get(`/users/${id}`);
  },

  // 创建用户
  createUser: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return post('/users', data);
  },

  // 更新用户
  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return put(`/users/${id}`, data);
  },

  // 删除用户
  deleteUser: (id: string): Promise<ApiResponse<null>> => {
    return del(`/users/${id}`);
  },

  // 批量删除用户
  batchDeleteUsers: (ids: string[]): Promise<ApiResponse<null>> => {
    return post('/users/batch-delete', { ids });
  },

  // 重置用户密码
  resetPassword: (id: string): Promise<ApiResponse<{ password: string }>> => {
    return post(`/users/${id}/reset-password`);
  },

  // 启用/禁用用户
  toggleUserStatus: (id: string, status: 'active' | 'inactive'): Promise<ApiResponse<null>> => {
    return put(`/users/${id}/status`, { status });
  },

  // 分配角色
  assignRoles: (id: string, roleIds: string[]): Promise<ApiResponse<null>> => {
    return post(`/users/${id}/roles`, { roleIds });
  },

  // 获取用户权限
  getUserPermissions: (id: string): Promise<ApiResponse<string[]>> => {
    return get(`/users/${id}/permissions`);
  },

  // 导出用户数据
  exportUsers: (params?: any): Promise<Blob> => {
    return get('/users/export', { 
      params,
      responseType: 'blob'
    });
  },

  // 导入用户数据
  importUsers: (file: File): Promise<ApiResponse<{ success: number; failed: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};