// 菜单相关类型
export interface Menu {
  id: string;
  name: string;
  i18nKey?: string;
  type: 'directory' | 'page' | 'button' | 'iframe';
  parentId?: string;
  icon?: string;
  path?: string;
  component?: string;
  externalUrl?: string; // iframe 外部链接
  permission?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  hideInMenu?: boolean;
  keepAlive?: boolean;
  description?: string;
  remark?: string;
  children?: Menu[];
  createTime?: string;
  updateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuFormData {
  name: string;
  type: 'directory' | 'page' | 'button' | 'iframe';
  parentId?: string;
  icon?: string;
  path?: string;
  component?: string;
  externalUrl?: string; // iframe 外部链接
  permission?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  hideInMenu?: boolean;
  keepAlive?: boolean;
  description?: string;
  remark?: string;
}

export interface MenuState {
  menus: Menu[];
  loading: boolean;
  total: number;
  currentMenu: Menu | null;
}