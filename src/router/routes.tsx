/**
 * @deprecated 此文件已被动态路由系统取代
 * 路由现在由菜单管理系统动态生成
 * 请参考：
 * - src/router/DynamicRoutes.tsx - 动态路由组件
 * - src/router/generateRoutes.tsx - 路由生成器
 * - src/router/componentMap.tsx - 组件映射表
 *
 * 此文件保留仅作为参考
 */

import React from "react";
import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

// 布局组件
import MainLayout from "@/layouts/MainLayout";

// 基础页面组件
import Home from "@/pages/base/Home";
import Login from "@/pages/base/Login";
import Dashboard from "@/pages/base/Dashboard";
import Profile from "@/pages/base/Profile";
import TemplateIntroduction from "@/pages/base/TemplateIntroduction";
import NotFound from "@/components/NotFound";

// 系统管理模块
import UserList from "@/pages/system/User/UserList";
import UserDetail from "@/pages/system/User/UserDetail";
import RoleList from "@/pages/system/Role/RoleList";
import MenuList from "@/pages/system/Menu/MenuList";
import SystemSettings from "@/pages/system/Settings";

// 工具模块
import MarkdownViewerPage from "@/pages/tools/MarkdownViewer";
import IframeView from "@/pages/tools/IframeView";
import { PixiEditor, RichTextEditor } from "@/pages/tools/Utils";

// 路由守卫组件
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// 定义路由配置
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/auth/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      // 模板介绍路由
      {
        path: "template-introduction",
        element: <TemplateIntroduction />,
      },
      // 用户管理路由
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "users/detail/:id",
        element: <UserDetail />,
      },
      // 角色管理路由
      {
        path: "roles",
        element: <RoleList />,
      },
      // 菜单管理路由
      {
        path: "menus",
        element: <MenuList />,
      },
      // 个人资料路由
      {
        path: "profile",
        element: <Profile />,
      },
      // 系统设置路由
      {
        path: "settings",
        element: <SystemSettings />,
      },

      // 工具路由
      {
        path: "util",
        children: [
          // 富文本编辑器路由
          {
            path: "richtext-editor",
            element: <RichTextEditor />,
          },
          // pixi编辑器路由
          {
            path: "pixi-editor",
            element: <PixiEditor />,
          },
          // Markdown 查看器路由
          {
            path: "markdown-viewer",
            element: <MarkdownViewerPage />,
          },
        ],
      },
      // Iframe 查看器路由
      {
        path: "iframe-view",
        element: <IframeView />,
      },
      // 默认重定向到仪表盘
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
