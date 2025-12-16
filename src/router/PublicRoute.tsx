import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { isAuthenticated } from '../utils/auth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const location = useLocation();
  const { isAuthenticated: isLoggedIn } = useAppSelector((state) => state.auth);

  // 检查是否已登录
  const authenticated = isAuthenticated() && isLoggedIn;

  // 如果已登录，重定向到指定页面或从state中获取的页面
  if (authenticated) {
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;