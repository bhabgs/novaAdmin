/**
 * 导出所有生成的 API 函数
 * 这个文件提供了一个便捷的方式来使用 orval 生成的 API
 */
import { getNovaAdminAPI } from './generated';

// 导出所有类型
export * from './generated';

// 创建 API 实例
const api = getNovaAdminAPI();

// 认证相关 API
export const authAPI = {
  login: api.authControllerLogin,
  logout: api.authControllerLogout,
  refreshToken: api.authControllerRefreshToken,
  getUserInfo: api.authControllerGetUserInfo,
  changePassword: api.authControllerChangePassword,
  resetPassword: api.authControllerResetPassword,
  verifyToken: api.authControllerVerifyToken,
};

// 用户管理 API
export const userAPI = {
  getList: api.usersControllerFindAll,
  create: api.usersControllerCreate,
  getById: api.usersControllerFindOne,
  update: api.usersControllerUpdate,
  delete: api.usersControllerDelete,
  batchDelete: api.usersControllerBatchDelete,
  resetPassword: api.usersControllerResetPassword,
  updateStatus: api.usersControllerUpdateStatus,
  assignRoles: api.usersControllerAssignRoles,
  getPermissions: api.usersControllerGetUserPermissions,
};

// 角色管理 API
export const roleAPI = {
  getList: api.rolesControllerFindAll,
  create: api.rolesControllerCreate,
  getAll: api.rolesControllerFindAllWithoutPagination,
  getPermissions: api.rolesControllerGetPermissions,
  getPermissionTree: api.rolesControllerGetPermissionTree,
  getById: api.rolesControllerFindOne,
  update: api.rolesControllerUpdate,
  delete: api.rolesControllerDelete,
  batchDelete: api.rolesControllerBatchDelete,
  assignPermissions: api.rolesControllerAssignPermissions,
  getRolePermissions: api.rolesControllerGetRolePermissions,
  copy: api.rolesControllerCopyRole,
};

// 菜单管理 API
export const menuAPI = {
  getList: api.menusControllerFindAll,
  create: api.menusControllerCreate,
  getTree: api.menusControllerFindTree,
  getIcons: api.menusControllerGetIcons,
  getById: api.menusControllerFindOne,
  update: api.menusControllerUpdate,
  delete: api.menusControllerDelete,
  batchDelete: api.menusControllerBatchDelete,
  updateSort: api.menusControllerUpdateSort,
  copy: api.menusControllerCopyMenu,
};

// 导出原始 API 对象以供需要直接访问的场景
export const generatedAPI = api;
