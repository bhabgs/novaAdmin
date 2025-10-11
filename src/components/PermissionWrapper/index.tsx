import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export interface PermissionWrapperProps {
  children: React.ReactNode;
  permission?: string | string[];
  role?: string | string[];
  fallback?: React.ReactNode;
  mode?: 'all' | 'any'; // all: 需要所有权限, any: 需要任一权限
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  role,
  fallback = null,
  mode = 'any'
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // 检查权限
  const hasPermission = (permissions: string | string[]): boolean => {
    if (!user || !user.permissions) return false;
    
    const userPermissions = user.permissions;
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    if (mode === 'all') {
      return requiredPermissions.every(perm => userPermissions.includes(perm));
    } else {
      return requiredPermissions.some(perm => userPermissions.includes(perm));
    }
  };

  // 检查角色
  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.roles) return false;
    
    const userRoles = user.roles.map(r => r.code);
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (mode === 'all') {
      return requiredRoles.every(role => userRoles.includes(role));
    } else {
      return requiredRoles.some(role => userRoles.includes(role));
    }
  };

  // 如果没有指定权限和角色，直接显示内容
  if (!permission && !role) {
    return <>{children}</>;
  }

  // 检查权限
  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionWrapper;