export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  userCount?: number;
  sortOrder?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface RoleFormData {
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  remark?: string;
}

export interface RoleState {
  roles: Role[];
  loading: boolean;
  total: number;
  currentRole: Role | null;
}