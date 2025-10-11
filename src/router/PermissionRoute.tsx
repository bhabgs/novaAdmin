import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission?: string | string[];
  role?: string | string[];
  mode?: 'all' | 'any'; // all: 需要所有权限, any: 需要任一权限
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  permission,
  role,
  mode = 'any'
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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

  // 如果没有权限，显示无权限页面
  if (!hasAccess) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="403"
          subTitle={t('common.noPermission')}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              {t('common.back')}
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionRoute;