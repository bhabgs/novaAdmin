// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  roles: Role[];
  status: 'active' | 'inactive' | 'banned';
  lastLoginTime?: string;
  loginCount?: number;
  onlineDuration?: string;
  joinTime?: string;
  permissions?: string[];
  remark?: string;
  createTime?: string;
  updateTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 角色引用类型 (简化版，完整定义在 role.ts)
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
  userCount?: number;
  sortOrder?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  status: 'active' | 'inactive' | 'banned';
  password?: string;
  confirmPassword?: string;
  remark?: string;
}

export interface UserState {
  users: User[];
  loading: boolean;
  total: number;
  currentUser: User | null;
}

export interface ActivityLog {
  id: string;
  action: string;
  actionTime: string;
  ipAddress: string;
}