import React, { Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import type { Menu } from '@/types/menu';
import { getComponent } from './componentMap';
import { Spin } from 'antd';

// 加载中组件
const RouteLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

/**
 * 将菜单数据转换为路由配置
 * @param menus - 菜单数据数组
 * @param parentPath - 父级路径（用于嵌套路由）
 * @returns React Router 路由配置数组
 */
export function generateRoutesFromMenus(
  menus: Menu[],
  parentPath: string = ''
): RouteObject[] {
  const routes: RouteObject[] = [];

  console.log('[generateRoutes] Processing menus:', menus.length, 'menus');

  menus.forEach((menu) => {
    // 只处理激活状态的菜单
    if (menu.status !== 'active') {
      return;
    }

    const route: RouteObject = {};

    // 处理不同类型的菜单
    if (menu.type === 'directory') {
      // 目录类型：只作为分组，不生成路由，递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        const childRoutes = generateRoutesFromMenus(menu.children, parentPath);
        routes.push(...childRoutes);
      }
    } else if (menu.type === 'page') {
      // 页面类型：生成路由
      if (menu.path && menu.component) {
        const Component = getComponent(menu.component);

        if (Component) {
          // 处理路径（移除开头的 /）
          const path = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;

          console.log(`[generateRoutes] ✓ Generating route: ${path} -> ${menu.component}`);

          route.path = path;
          route.element = (
            <Suspense fallback={<RouteLoading />}>
              <Component />
            </Suspense>
          );

          // 如果有子菜单，递归生成子路由
          if (menu.children && menu.children.length > 0) {
            route.children = generateRoutesFromMenus(menu.children, path);
          }

          routes.push(route);
        } else {
          console.warn(`[generateRoutes] ✗ Component "${menu.component}" not found for menu: ${menu.name}`);
        }
      } else {
        console.warn(`[generateRoutes] ✗ Menu missing path or component:`, menu.name);
      }
    }
    // button 类型不生成路由，只用于权限控制
  });

  return routes;
}

/**
 * 生成完整的应用路由配置（包括固定路由）
 * @param userMenus - 用户菜单数据
 * @returns 完整的路由配置数组
 */
export function generateAppRoutes(userMenus: Menu[]): RouteObject[] {
  // 从菜单生成动态路由
  const dynamicRoutes = generateRoutesFromMenus(userMenus);

  // 添加默认重定向
  const defaultRedirect: RouteObject = {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  };

  return [...dynamicRoutes, defaultRedirect];
}

/**
 * 扁平化菜单树为路由列表（用于权限检查）
 * @param menus - 菜单数据
 * @returns 扁平化的菜单路径数组
 */
export function flattenMenuPaths(menus: Menu[]): string[] {
  const paths: string[] = [];

  function flatten(menuList: Menu[]) {
    menuList.forEach((menu) => {
      if (menu.type === 'page' && menu.path) {
        paths.push(menu.path);
      }
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  }

  flatten(menus);
  return paths;
}

/**
 * 根据路径查找菜单项
 * @param menus - 菜单数据
 * @param path - 路径
 * @returns 找到的菜单项或 null
 */
export function findMenuByPath(menus: Menu[], path: string): Menu | null {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(menu.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
