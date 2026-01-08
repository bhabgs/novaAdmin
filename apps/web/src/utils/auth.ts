// 认证相关工具函数

const TOKEN_KEY = 'nova_admin_token';
const REFRESH_TOKEN_KEY = 'nova_admin_refresh_token';
const USER_KEY = 'nova_admin_user';

// Token管理
export const tokenUtils = {
  // 获取token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 设置token
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 移除token
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 获取刷新token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // 设置刷新token
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  // 移除刷新token
  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // 检查token是否存在
  hasToken(): boolean {
    return !!this.getToken();
  },
};

// 用户信息管理
export const userUtils = {
  // 获取用户信息
  getUser(): any | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // 设置用户信息
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 移除用户信息
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },
};

// 权限检查
export const permissionUtils = {
  // 检查用户是否有指定权限
  hasPermission(permission: string): boolean {
    const user = userUtils.getUser();
    if (!user || !user.roles) return false;

    return user.roles.some((role: any) =>
      role.permissions?.some((perm: any) => perm.code === permission),
    );
  },

  // 检查用户是否有指定角色
  hasRole(roleName: string): boolean {
    const user = userUtils.getUser();
    if (!user || !user.roles) return false;

    return user.roles.some((role: any) => role.name === roleName);
  },

  // 检查用户是否有任一权限
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  },

  // 检查用户是否有所有权限
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  },
};

// Mock 菜单数据键名
const MENU_STORAGE_KEY = 'mock_menus_data';
const MENU_VERSION_KEY = 'mock_menus_version';

// 清除所有认证信息
export const clearAuth = (): void => {
  tokenUtils.removeToken();
  tokenUtils.removeRefreshToken();
  userUtils.removeUser();
  // 清除菜单缓存，确保下次登录使用最新菜单数据
  localStorage.removeItem(MENU_STORAGE_KEY);
  localStorage.removeItem(MENU_VERSION_KEY);
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return tokenUtils.hasToken() && !!userUtils.getUser();
};
