/**
 * 公共类型定义
 */

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 通用状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 1,
  MENU = 2,
  BUTTON = 3,
}

// 基础实体接口
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// 用户信息
export interface User extends BaseEntity {
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: Status;
  departmentId?: string;
  department?: Department;
  roles?: Role[];
}

// 部门信息
export interface Department extends BaseEntity {
  name: string;
  parentId?: string;
  sort?: number;
  status: Status;
  children?: Department[];
}

// 角色信息
export interface Role extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  status: Status;
  permissions?: string[];
}

// 菜单信息
export interface Menu extends BaseEntity {
  name: string;
  nameI18n?: string;
  parentId?: string;
  path?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  type: MenuType;
  permission?: string;
  sort?: number;
  visible?: boolean;
  status: Status;
  children?: Menu[];
}

// 标签页项
export interface TabItem {
  key: string;
  label: string;
  path: string;
  closable?: boolean;
  nameI18n?: string;
}

// 侧边栏菜单项（用于渲染）
export interface SidebarMenuItem {
  id: string;
  path?: string;
  name: string;
  icon?: string;
  type: MenuType;
  nameI18n?: string;
  children?: SidebarMenuItem[];
}

// API 响应包装
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 表单模式
export type FormMode = 'create' | 'edit' | 'view';

// 列表查询参数
export interface ListQueryParams extends PaginationParams {
  keyword?: string;
  status?: Status;
  [key: string]: unknown;
}
