import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchUserInfo } from '@/store/slices/authSlice';
import { isAuthenticated } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [] 
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, loading, isAuthenticated: isLoggedIn } = useAppSelector((state) => state.auth);

  // 检查是否已登录
  const authenticated = isAuthenticated() && isLoggedIn;

  useEffect(() => {
    // 如果有token但没有用户信息，尝试获取用户信息
    if (isAuthenticated() && !user && !loading) {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, user, loading]);

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return <Spin fullscreen size="large" tip="加载中..." />;
  }

  // 如果未登录，重定向到登录页
  if (!authenticated) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 检查权限
  if (requiredPermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return (
        <Navigate 
          to="/403" 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;