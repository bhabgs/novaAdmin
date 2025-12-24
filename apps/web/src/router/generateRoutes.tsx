import React, {
  Suspense,
  lazy,
  ComponentType,
  LazyExoticComponent,
} from "react";
import { RouteObject, Navigate } from "react-router-dom";
import type { Menu } from "@/types/menu";
import { getComponent } from "./componentMap";
import { Spin } from "antd";
import IframeContainer from "@/components/IframeContainer";

// 加载中组件
const RouteLoading: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <Spin size="large" />
  </div>
);

/**
 * 使用 Vite 的 import.meta.glob 预加载所有页面组件
 * 支持 .tsx 和 .ts 文件，包括 index 文件
 */
const pageModules = import.meta.glob<{ default: ComponentType<any> }>(
  "/src/pages/**/*.{tsx,ts}",
  { eager: false }
);

/**
 * 根据组件路径动态导入组件
 * 支持两种格式：
 * 1. 路径格式：'base/Dashboard' 或 'system/User/UserList'
 * 2. 组件名格式：'Dashboard' 或 'UserList'（向后兼容，从 componentMap 查找）
 *
 * @param componentPath - 组件路径或组件名
 * @returns 懒加载的组件或 null
 */
function loadComponentByPath(
  componentPath: string
): LazyExoticComponent<ComponentType<any>> | null {
  try {
    // 如果包含 '/'，说明是路径格式
    if (componentPath.includes("/")) {
      console.log(
        `[loadComponent] Loading component by path: ${componentPath}`
      );

      // 尝试多种可能的文件路径
      const possiblePaths = [
        `/src/pages/${componentPath}.tsx`,
        `/src/pages/${componentPath}.ts`,
        `/src/pages/${componentPath}/index.tsx`,
        `/src/pages/${componentPath}/index.ts`,
      ];

      for (const modulePath of possiblePaths) {
        if (pageModules[modulePath]) {
          console.log(`[loadComponent] ✓ Found module: ${modulePath}`);
          return lazy(() =>
            pageModules[modulePath]().then((m) => ({
              default: m.default,
            }))
          );
        }
      }

      console.error(
        `[loadComponent] ✗ Component not found for path: ${componentPath}`
      );
      console.log(
        "[loadComponent] Available modules:",
        Object.keys(pageModules).filter((key) => key.includes(componentPath))
      );
      return null;
    } else {
      // 组件名格式：从 componentMap 查找（向后兼容）
      console.log(
        `[loadComponent] Loading component by name from componentMap: ${componentPath}`
      );
      return getComponent(componentPath);
    }
  } catch (error) {
    console.error(
      `[loadComponent] Failed to load component: ${componentPath}`,
      error
    );
    return null;
  }
}

/**
 * 将菜单数据转换为路由配置
 * @param menus - 菜单数据数组
 * @param parentPath - 父级路径（用于嵌套路由）
 * @returns React Router 路由配置数组
 */
export function generateRoutesFromMenus(
  menus: Menu[],
  parentPath: string = ""
): RouteObject[] {
  const routes: RouteObject[] = [];

  console.log("[generateRoutes] Processing menus:", menus.length, "menus");

  menus.forEach((menu) => {
    // 只处理激活状态的菜单
    if (menu.status !== "active") {
      return;
    }

    const route: RouteObject = {};

    // 处理不同类型的菜单
    if (menu.type === "directory") {
      // 目录类型：只作为分组，不生成路由，递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        const childRoutes = generateRoutesFromMenus(menu.children, parentPath);
        routes.push(...childRoutes);
      }
    } else if (menu.type === "page") {
      // 页面类型：生成路由
      if (menu.path && menu.component) {
        const Component = loadComponentByPath(menu.component);

        if (Component) {
          // 处理路径（移除开头的 /）
          const path = menu.path.startsWith("/")
            ? menu.path.slice(1)
            : menu.path;

          console.log(
            `[generateRoutes] ✓ Generating route: ${path} -> ${menu.component}`
          );

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
          console.warn(
            `[generateRoutes] ✗ Component "${menu.component}" not found for menu: ${menu.name}`
          );
        }
      } else {
        console.warn(
          `[generateRoutes] ✗ Menu missing path or component:`,
          menu.name
        );
      }
    } else if (menu.type === "iframe") {
      // iframe 类型：生成 iframe 路由
      if (menu.path && menu.externalUrl) {
        // 处理路径（移除开头的 /）
        const path = menu.path.startsWith("/")
          ? menu.path.slice(1)
          : menu.path;

        console.log(
          `[generateRoutes] ✓ Generating iframe route: ${path} -> ${menu.externalUrl}`
        );

        route.path = path;
        route.element = (
          <IframeContainer url={menu.externalUrl} title={menu.name} />
        );

        routes.push(route);
      } else {
        console.warn(
          `[generateRoutes] ✗ Iframe menu missing path or externalUrl:`,
          menu.name
        );
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
      if ((menu.type === "page" || menu.type === "iframe") && menu.path) {
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
