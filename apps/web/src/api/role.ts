import { Role, Permission, ApiResponse, ListResponse } from '../types';
import { get, post, put, del } from './request';

// 角色管理相关API
export const roleApi = {
  // 获取角色列表
  getRoles: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<ApiResponse<ListResponse<Role>>> => {
    return get('/roles', { params });
  },

  // 获取所有角色（不分页）
  getAllRoles: (): Promise<ApiResponse<Role[]>> => {
    return get('/roles/all');
  },

  // 获取角色详情
  getRoleById: (id: string): Promise<ApiResponse<Role>> => {
    return get(`/roles/${id}`);
  },

  // 创建角色
  createRole: (data: Partial<Role>): Promise<ApiResponse<Role>> => {
    return post('/roles', data);
  },

  // 更新角色
  updateRole: (id: string, data: Partial<Role>): Promise<ApiResponse<Role>> => {
    return put(`/roles/${id}`, data);
  },

  // 删除角色
  deleteRole: (id: string): Promise<ApiResponse<null>> => {
    return del(`/roles/${id}`);
  },

  // 分配权限
  assignPermissions: (roleId: string, permissionIds: string[]): Promise<ApiResponse<null>> => {
    return post(`/roles/${roleId}/permissions`, { permissionIds });
  },

  // 获取角色权限
  getRolePermissions: (roleId: string): Promise<ApiResponse<Permission[]>> => {
    return get(`/roles/${roleId}/permissions`);
  },

  // 获取权限列表
  getPermissions: (): Promise<ApiResponse<Permission[]>> => {
    return get('/roles/permissions');
  },

  // 获取权限树
  getPermissionTree: (): Promise<ApiResponse<Permission[]>> => {
    return get('/roles/permissions/tree');
  },

  // 复制角色
  copyRole: (id: string, name?: string): Promise<ApiResponse<Role>> => {
    return post(`/roles/${id}/copy`, { name });
  },

  // 批量删除角色
  batchDeleteRoles: (ids: string[]): Promise<ApiResponse<null>> => {
    return post('/roles/batch', { ids });
  },
};
