// 语言类型定义
export type Language = 'zh-CN' | 'en-US' | 'ar-SA';

// 导出其他模块类型(需要在文件顶部导出,因为下面的接口会用到)
export type { User, UserFormData, UserState, ActivityLog, Role } from './user';
export type { Role as RoleDetailed, RoleFormData, RoleState } from './role';
export type { Menu, MenuFormData, MenuState } from './menu';

// 国际化配置类型
export interface I18nConfig {
  language: Language;
  fallbackLanguage: Language;
  supportedLanguages: Language[];
}

// 权限相关类型
export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: 'menu' | 'button' | 'api';
  createdAt: string;
}

// 登录相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ListResponse<T> {
  list: T[];
  pagination: PaginationParams;
}

// 主题相关类型
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  borderRadius: number;
}

// 布局模式类型
export type LayoutMode = 'side' | 'top' | 'mix';

// 布局配置类型
export interface LayoutConfig {
  // 布局模式：side=侧边菜单, top=顶部菜单, mix=混合模式
  mode: LayoutMode;
  // 侧边栏配置
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  sidebarTheme: 'light' | 'dark';
  // 头部配置
  headerHeight: number;
  fixedHeader: boolean;
  // 标签页配置
  showTabs: boolean;
  // 内容区域配置
  contentWidth: 'fluid' | 'fixed';
  // 页脚配置
  showFooter: boolean;
}

// 系统设置类型
export interface SystemSettings {
  theme: ThemeConfig;
  language: Language;
  layout: LayoutConfig;
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  userGrowthRate: number;
  orderGrowthRate: number;
  revenueGrowthRate: number;
  productGrowthRate: number;
}

// 图表数据类型
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}