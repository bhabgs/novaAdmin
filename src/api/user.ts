import { User, ApiResponse, ListResponse } from '../types';
import { mockUsers } from '@/data/users';

// 本地用户列表（可以被修改）
let localUsers: User[] = JSON.parse(JSON.stringify(mockUsers));

// 辅助函数：搜索过滤
const filterByKeyword = (users: User[], keyword: string, fields: string[]): User[] => {
  if (!keyword) return users;
  return users.filter((user) =>
    fields.some((field) =>
      (user[field as keyof User] as any)?.toString().toLowerCase().includes(keyword.toLowerCase())
    )
  );
};

// 用户管理相关API - 使用本地假数据
export const userApi = {
  // 获取用户列表
  getUsers: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    role?: string;
  }): Promise<ApiResponse<ListResponse<User>>> => {
    const { page = 1, pageSize = 10, keyword = '', status = '', role = '' } = params || {};

    let filteredUsers = [...localUsers];

    // 关键词搜索
    if (keyword) {
      filteredUsers = filterByKeyword(filteredUsers, keyword, ['username', 'name', 'email', 'phone']);
    }

    // 状态过滤
    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    // 角色过滤
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.roles?.includes(role));
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredUsers.slice(start, end);

    return Promise.resolve({
      success: true,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total: filteredUsers.length,
        },
      },
      message: '获取成功',
    });
  },

  // 获取用户详情
  getUserById: (id: string): Promise<ApiResponse<User>> => {
    const user = localUsers.find((u) => u.id === id);

    if (!user) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '用户不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: user,
      message: '获取成功',
    });
  },

  // 创建用户
  createUser: (data: Partial<User>): Promise<ApiResponse<User>> => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: data.username || '',
      email: data.email || '',
      name: data.name || '',
      avatar: data.avatar || '',
      phone: data.phone || '',
      status: data.status || 'active',
      roles: data.roles || [],
      permissions: data.permissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localUsers.push(newUser);

    return Promise.resolve({
      success: true,
      data: newUser,
      message: '创建成功',
    });
  },

  // 更新用户
  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const userIndex = localUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '用户不存在',
        code: 404,
      });
    }

    localUsers[userIndex] = {
      ...localUsers[userIndex],
      ...data,
      id, // 保持ID不变
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: localUsers[userIndex],
      message: '更新成功',
    });
  },

  // 删除用户
  deleteUser: (id: string): Promise<ApiResponse<null>> => {
    // 不能删除管理员用户
    if (id === '1') {
      return Promise.resolve({
        success: false,
        data: null,
        message: '不能删除管理员用户',
        code: 403,
      });
    }

    const userIndex = localUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return Promise.resolve({
        success: false,
        data: null,
        message: '用户不存在',
        code: 404,
      });
    }

    localUsers.splice(userIndex, 1);

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 批量删除用户
  batchDeleteUsers: (ids: string[]): Promise<ApiResponse<null>> => {
    // 过滤掉管理员ID
    const deleteIds = ids.filter((id) => id !== '1');
    localUsers = localUsers.filter((u) => !deleteIds.includes(u.id));

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 重置用户密码
  resetPassword: (id: string): Promise<ApiResponse<{ password: string }>> => {
    const newPassword = Math.random().toString(36).substr(2, 8);

    return Promise.resolve({
      success: true,
      data: { password: newPassword },
      message: '密码已重置',
    });
  },

  // 启用/禁用用户
  toggleUserStatus: (id: string, status: 'active' | 'inactive'): Promise<ApiResponse<null>> => {
    // 不能禁用管理员
    if (id === '1' && status === 'inactive') {
      return Promise.resolve({
        success: false,
        data: null,
        message: '不能禁用管理员用户',
        code: 403,
      });
    }

    const user = localUsers.find((u) => u.id === id);

    if (user) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '状态已更新',
    });
  },

  // 分配角色
  assignRoles: (id: string, roleIds: string[]): Promise<ApiResponse<null>> => {
    const user = localUsers.find((u) => u.id === id);

    if (user) {
      user.roles = roleIds;
      user.updatedAt = new Date().toISOString();
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '角色已分配',
    });
  },

  // 获取用户权限
  getUserPermissions: (id: string): Promise<ApiResponse<string[]>> => {
    const user = localUsers.find((u) => u.id === id);

    if (!user) {
      return Promise.resolve({
        success: false,
        data: [],
        message: '用户不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: user.permissions || [],
      message: '获取成功',
    });
  },

  // 导出用户数据
  exportUsers: (params?: any): Promise<Blob> => {
    const csv = convertToCSV(localUsers);
    return Promise.resolve(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  },

  // 导入用户数据
  importUsers: (file: File): Promise<ApiResponse<{ success: number; failed: number }>> => {
    // 简单的模拟导入
    return Promise.resolve({
      success: true,
      data: { success: 10, failed: 0 },
      message: '导入成功',
    });
  },
};

// 辅助函数：转换为CSV
function convertToCSV(users: User[]): string {
  const headers = ['ID', 'Username', 'Email', 'Name', 'Phone', 'Status'];
  const rows = users.map((user) => [
    user.id,
    user.username,
    user.email,
    user.name,
    user.phone,
    user.status,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return csv;
}