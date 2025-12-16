import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * 页面组件懒加载映射表
 * 将菜单中的 component 字段映射到实际的 React 组件
 *
 * 目录结构:
 * - base/: 基础模块 (Dashboard, Home, Login, Profile, TemplateIntroduction)
 * - system/: 系统管理 (User, Role, Menu, Settings)
 * - tools/: 工具模块 (Utils, MarkdownViewer, IframeView)
 * - Games/: 游戏模块
 */
export const componentMap: Record<string, LazyExoticComponent<ComponentType<any>>> = {
  // ===== 基础模块 (base/) =====
  Home: lazy(() => import('@/pages/base/Home')),
  Dashboard: lazy(() => import('@/pages/base/Dashboard')),
  TemplateIntroduction: lazy(() => import('@/pages/base/TemplateIntroduction')),
  Profile: lazy(() => import('@/pages/base/Profile')),

  // ===== 系统管理 (system/) =====
  // 用户管理
  UserList: lazy(() => import('@/pages/system/User/UserList')),
  UserDetail: lazy(() => import('@/pages/system/User/UserDetail')),

  // 角色管理
  RoleList: lazy(() => import('@/pages/system/Role/RoleList')),

  // 菜单管理
  MenuList: lazy(() => import('@/pages/system/Menu/MenuList')),

  // 系统设置
  Settings: lazy(() => import('@/pages/system/Settings')),
  SystemSettings: lazy(() => import('@/pages/system/Settings')),

  // ===== 工具模块 (tools/) =====
  MarkdownViewer: lazy(() => import('@/pages/tools/MarkdownViewer')),
  MarkdownViewerPage: lazy(() => import('@/pages/tools/MarkdownViewer')),
  RichTextEditor: lazy(() => import('@/pages/tools/Utils/RichTextEditor')),
  PixiEditor: lazy(() => import('@/pages/tools/Utils/PixiEditor')),
  IframeView: lazy(() => import('@/pages/tools/IframeView')),
};

/**
 * 根据组件名称获取懒加载组件
 * @param componentName - 组件名称（来自菜单配置）
 * @returns 懒加载的组件或 null
 */
export function getComponent(componentName: string): LazyExoticComponent<ComponentType<any>> | null {
  return componentMap[componentName] || null;
}

/**
 * 检查组件是否存在
 * @param componentName - 组件名称
 * @returns 是否存在对应的组件
 */
export function hasComponent(componentName: string): boolean {
  return componentName in componentMap;
}

/**
 * 获取所有已注册的组件名称
 * @returns 组件名称数组
 */
export function getRegisteredComponents(): string[] {
  return Object.keys(componentMap);
}
