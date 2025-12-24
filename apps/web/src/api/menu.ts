import { Menu, ApiResponse } from '../types';
import { get, post, put, del } from './request';

// 菜单管理相关API
export const menuApi = {
  // 获取菜单列表（扁平结构）
  getMenus: (): Promise<ApiResponse<Menu[]>> => {
    return get('/menus');
  },

  // 获取用户菜单（根据权限过滤）- 返回树形结构用于左侧导航
  getUserMenus: (): Promise<ApiResponse<Menu[]>> => {
    return get('/menus/tree');
  },

  // 获取菜单详情
  getMenuById: (id: string): Promise<ApiResponse<Menu>> => {
    return get(`/menus/${id}`);
  },

  // 创建菜单
  createMenu: (data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    return post('/menus', data);
  },

  // 更新菜单
  updateMenu: (id: string, data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    return put(`/menus/${id}`, data);
  },

  // 删除菜单
  deleteMenu: (id: string): Promise<ApiResponse<null>> => {
    return del(`/menus/${id}`);
  },

  // 更新菜单排序
  updateMenuSort: (menus: { id: string; sortOrder: number; parentId?: string }[]): Promise<ApiResponse<null>> => {
    return put('/menus/sort', { menus });
  },

  // 获取菜单图标列表
  getMenuIcons: (): Promise<ApiResponse<string[]>> => {
    return get('/menus/icons');
  },

  // 批量删除菜单
  batchDeleteMenus: (ids: string[]): Promise<ApiResponse<null>> => {
    return post('/menus/batch', { ids });
  },

  // 复制菜单
  copyMenu: (id: string, parentId?: string): Promise<ApiResponse<Menu>> => {
    return post(`/menus/${id}/copy`, { parentId });
  },

  // 移动菜单
  moveMenu: (id: string, parentId: string, index: number): Promise<ApiResponse<null>> => {
    return put(`/menus/${id}`, { parentId, sortOrder: index });
  },
};
