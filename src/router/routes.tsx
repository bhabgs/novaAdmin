import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// 布局组件
import MainLayout from '../layouts/MainLayout';

// 页面组件
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../components/NotFound';

// 用户管理模块
import UserList from '../pages/User/UserList';
import UserDetail from '../pages/User/UserDetail';

// 角色管理模块
import RoleList from '../pages/Role/RoleList';

// 菜单管理模块
import MenuList from '../pages/Menu/MenuList';

// 系统设置模块
import SystemSettings from '../pages/Settings';
import Profile from '../pages/Profile';

// Markdown 查看器
import MarkdownViewerPage from '../pages/MarkdownViewer';

// Iframe 查看器
import IframeView from '../pages/IframeView';
import IframeDemo from '../pages/IframeDemo';

// 路由守卫组件
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// 定义路由配置
export const routes: RouteObject[] = [
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
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // 用户管理路由
      {
        path: 'users',
        element: <UserList />,
      },
      {
        path: 'users/detail/:id',
        element: <UserDetail />,
      },
      // 角色管理路由
      {
        path: 'roles',
        element: <RoleList />,
      },
      // 菜单管理路由
      {
        path: 'menus',
        element: <MenuList />,
      },
      // 个人资料路由
      {
        path: 'profile',
        element: <Profile />,
      },
      // 系统设置路由
      {
        path: 'settings',
        element: <SystemSettings />,
      },
      // Markdown 查看器路由
      {
        path: 'markdown-viewer',
        element: <MarkdownViewerPage />,
      },
      // Iframe 查看器路由
      {
        path: 'iframe-view',
        element: <IframeView />,
      },
      {
        path: 'iframe-demo',
        element: <IframeDemo />,
      },
      // 默认重定向到仪表盘
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;