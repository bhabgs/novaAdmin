import React, { useEffect, useMemo } from 'react';
import { useRoutes, RouteObject, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUserMenus } from '@/store/slices/menuSlice';
import { generateAppRoutes } from './generateRoutes';
import { Spin } from 'antd';
import { useNProgress } from '@/hooks/useNProgress';

// 布局组件
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/base/Login';
import Home from '@/pages/base/Home';
import NotFound from '@/components/NotFound';

// 路由守卫
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

/**
 * 动态路由组件
 * 根据用户菜单权限动态生成路由
 */
const DynamicRoutes: React.FC = () => {
  // 启用路由切换进度条
  useNProgress();

  const dispatch = useAppDispatch();
  const { userMenus, loading } = useAppSelector((state) => state.menu);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // 获取用户菜单
  useEffect(() => {
    if (isAuthenticated && userMenus.length === 0) {
      dispatch(fetchUserMenus());
    }
  }, [dispatch, isAuthenticated, userMenus.length]);

  // 生成路由配置
  const routes: RouteObject[] = useMemo(() => {
    console.log('[DynamicRoutes] Generating routes, userMenus:', userMenus);

    // 固定的公共路由（不需要权限）
    const publicRoutes: RouteObject[] = [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '/auth/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
    ];

    // 受保护的动态路由（根据用户菜单生成）
    const dynamicChildren = isAuthenticated && userMenus.length > 0
      ? generateAppRoutes(userMenus)
      : [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
        ];

    console.log('[DynamicRoutes] Generated dynamic children:', dynamicChildren);

    const protectedRoutes: RouteObject = {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: dynamicChildren,
    };

    // 404 路由
    const notFoundRoute: RouteObject = {
      path: '*',
      element: <NotFound />,
    };

    return [...publicRoutes, protectedRoutes, notFoundRoute];
  }, [userMenus, isAuthenticated]);

  const element = useRoutes(routes);

  // 加载中状态
  if (isAuthenticated && loading && userMenus.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="加载菜单中..." />
      </div>
    );
  }

  return <>{element}</>;
};

export default DynamicRoutes;
