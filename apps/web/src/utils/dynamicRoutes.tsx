import React, { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { RouteObject } from 'react-router-dom';

/**
 * 使用 Vite 的 import.meta.glob 预加载所有页面组件
 * 支持 .tsx 和 .ts 文件，包括 index 文件
 */
const pageModules = import.meta.glob<{ default: ComponentType<any> }>('/src/pages/**/*.{tsx,ts}', {
  eager: false,
});

// 加载中组件
const RouteLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

/**
 * 根据组件路径动态导入组件
 * 支持格式：
 * - 'pages/dashboard/index' (带 pages/ 前缀)
 * - 'dashboard/index' (不带前缀)
 * - 'dashboard' (自动查找 index 文件)
 *
 * @param componentPath - 组件路径
 * @returns 懒加载的组件或 null
 */
function loadComponentByPath(
  componentPath: string,
): LazyExoticComponent<ComponentType<any>> | null {
  try {
    // 如果路径以 pages/ 开头，去掉这个前缀
    let normalizedPath = componentPath;
    if (normalizedPath.startsWith('pages/')) {
      normalizedPath = normalizedPath.slice(6); // 去掉 'pages/'
    }

    // 尝试多种可能的文件路径
    const possiblePaths = [
      `/src/pages/${normalizedPath}.tsx`,
      `/src/pages/${normalizedPath}.ts`,
      `/src/pages/${normalizedPath}/index.tsx`,
      `/src/pages/${normalizedPath}/index.ts`,
    ];

    for (const modulePath of possiblePaths) {
      if (pageModules[modulePath]) {
        return lazy(() =>
          pageModules[modulePath]().then((m) => ({
            default: m.default,
          })),
        );
      }
    }

    return null;
  } catch (error) {
    console.error(`[loadComponent] Failed to load component: ${componentPath}`, error);
    return null;
  }
}

/**
 * 将菜单树转换为路由配置（递归处理树形结构）
 * 只为菜单类型 (type=2) 生成路由，目录类型 (type=1) 不生成路由
 * @param menus - 菜单数据数组（树形结构）
 * @returns React Router 路由配置数组
 */
export const generateRoutesFromMenus = (menus: any[]): RouteObject[] => {
  const routes: RouteObject[] = [];

  const processMenu = (menu: any) => {
    if (menu.status !== 1) return;

    // 菜单类型 (type=2) 生成路由
    if (menu.type === 2 && menu.path && menu.component) {
      const Component = loadComponentByPath(menu.component);
      if (Component) {
        const path = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;
        routes.push({
          path,
          element: (
            <Suspense fallback={<RouteLoading />}>
              <Component />
            </Suspense>
          ),
        });
      } else {
        console.warn(
          `[generateRoutes] ✗ Component "${menu.component}" not found for menu: ${menu.name}`,
        );
      }
    }

    // 递归处理子菜单
    if (menu.children?.length > 0) {
      menu.children.forEach(processMenu);
    }
  };

  menus.forEach(processMenu);
  return routes;
};

/**
 * 将菜单树转换为侧边栏菜单项（后端已返回树形结构）
 */
export const generateMenuItemsFromMenus = (menus: any[]): any[] => {
  if (!menus || menus.length === 0) {
    return [];
  }

  const mapMenu = (menu: any): any | null => {
    if (menu.status !== 1 || menu.visible === false) return null;

    const children =
      menu.children?.length > 0 ? menu.children.map(mapMenu).filter(Boolean) : undefined;

    return {
      id: menu.id,
      path: menu.path,
      name: menu.name,
      icon: menu.icon,
      type: menu.type,
      nameI18n: menu.nameI18n,
      children: children?.length > 0 ? children : undefined,
    };
  };

  return menus.map(mapMenu).filter(Boolean);
};

/**
 * 扁平化菜单树为路由列表（用于权限检查）
 */
export const flattenMenuPaths = (menus: any[]): string[] => {
  const paths: string[] = [];

  function flatten(menuList: any[]) {
    menuList.forEach((menu) => {
      if (menu.type === 2 && menu.path) {
        paths.push(menu.path);
      }
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  }

  flatten(menus);
  return paths;
};

/**
 * 根据路径查找菜单项
 */
export const findMenuByPath = (menus: any[], path: string): any | null => {
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
};
