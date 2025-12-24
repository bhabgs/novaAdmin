import { Role, Permission, ApiResponse, ListResponse } from '../types';
import { mockRoles, mockPermissions } from '@/data/roles';

// 本地角色和权限列表
let localRoles: Role[] = JSON.parse(JSON.stringify(mockRoles));
let localPermissions: Permission[] = JSON.parse(JSON.stringify(mockPermissions));

// 角色管理相关API - 使用本地假数据
export const roleApi = {
  // 获取角色列表
  getRoles: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<ApiResponse<ListResponse<Role>>> => {
    const { page = 1, pageSize = 10, keyword = '' } = params || {};

    let filteredRoles = [...localRoles];

    if (keyword) {
      filteredRoles = filteredRoles.filter((role) =>
        role.name.toLowerCase().includes(keyword.toLowerCase()) ||
        role.code.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredRoles.slice(start, end);

    return Promise.resolve({
      success: true,
      data: {
        list,
        pagination: { page, pageSize, total: filteredRoles.length },
      },
      message: '获取成功',
    });
  },

  // 获取所有角色（不分页）
  getAllRoles: (): Promise<ApiResponse<Role[]>> => {
    return Promise.resolve({
      success: true,
      data: localRoles,
      message: '获取成功',
    });
  },

  // 获取角色详情
  getRoleById: (id: string): Promise<ApiResponse<Role>> => {
    const role = localRoles.find((r) => r.id === id);

    if (!role) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '角色不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: role,
      message: '获取成功',
    });
  },

  // 创建角色
  createRole: (data: Partial<Role>): Promise<ApiResponse<Role>> => {
    const newRole: Role = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      permissions: data.permissions || [],
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localRoles.push(newRole);

    return Promise.resolve({
      success: true,
      data: newRole,
      message: '创建成功',
    });
  },

  // 更新角色
  updateRole: (id: string, data: Partial<Role>): Promise<ApiResponse<Role>> => {
    const roleIndex = localRoles.findIndex((r) => r.id === id);

    if (roleIndex === -1) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '角色不存在',
        code: 404,
      });
    }

    localRoles[roleIndex] = {
      ...localRoles[roleIndex],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: localRoles[roleIndex],
      message: '更新成功',
    });
  },

  // 删除角色
  deleteRole: (id: string): Promise<ApiResponse<null>> => {
    const roleIndex = localRoles.findIndex((r) => r.id === id);

    if (roleIndex === -1) {
      return Promise.resolve({
        success: false,
        data: null,
        message: '角色不存在',
        code: 404,
      });
    }

    localRoles.splice(roleIndex, 1);

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 分配权限
  assignPermissions: (roleId: string, permissionIds: string[]): Promise<ApiResponse<null>> => {
    const role = localRoles.find((r) => r.id === roleId);

    if (role) {
      role.permissions = permissionIds;
      role.updatedAt = new Date().toISOString();
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '权限已分配',
    });
  },

  // 获取角色权限
  getRolePermissions: (roleId: string): Promise<ApiResponse<Permission[]>> => {
    const role = localRoles.find((r) => r.id === roleId);

    if (!role) {
      return Promise.resolve({
        success: false,
        data: [],
        message: '角色不存在',
        code: 404,
      });
    }

    const permissions = localPermissions.filter((p) =>
      role.permissions.includes(p.code)
    );

    return Promise.resolve({
      success: true,
      data: permissions,
      message: '获取成功',
    });
  },

  // 获取权限列表
  getPermissions: (): Promise<ApiResponse<Permission[]>> => {
    return Promise.resolve({
      success: true,
      data: localPermissions,
      message: '获取成功',
    });
  },

  // 获取权限树
  getPermissionTree: (): Promise<ApiResponse<Permission[]>> => {
    return Promise.resolve({
      success: true,
      data: localPermissions,
      message: '获取成功',
    });
  },

  // 复制角色
  copyRole: (id: string, name?: string): Promise<ApiResponse<Role>> => {
    const role = localRoles.find((r) => r.id === id);

    if (!role) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '角色不存在',
        code: 404,
      });
    }

    const copied: Role = {
      ...role,
      id: Math.random().toString(36).substr(2, 9),
      name: name || `${role.name}(副本)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localRoles.push(copied);

    return Promise.resolve({
      success: true,
      data: copied,
      message: '复制成功',
    });
  },

  // 批量删除角色
  batchDeleteRoles: (ids: string[]): Promise<ApiResponse<null>> => {
    localRoles = localRoles.filter((r) => !ids.includes(r.id));

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },
};