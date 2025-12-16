/**
 * 路由工具函数导出
 * 提供路由相关的工具方法
 */

export { getComponent, hasComponent, getRegisteredComponents } from './componentMap';
export {
  generateRoutesFromMenus,
  generateAppRoutes,
  flattenMenuPaths,
  findMenuByPath,
} from './generateRoutes';
