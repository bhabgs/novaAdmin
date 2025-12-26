import { createAsyncThunk } from '@reduxjs/toolkit';
import { Role, ApiResponse } from '../../types';
import {
  rolesControllerFindAll,
  rolesControllerFindOne,
  rolesControllerCreate,
  rolesControllerUpdate,
  rolesControllerDelete,
  rolesControllerAssignMenus,
  type CreateRoleDto,
  type UpdateRoleDto,
} from '../../api';
import { createCrudSlice, CrudState } from '../createCrudSlice';

// 使用工厂函数创建基础 CRUD slice
const { slice, thunks, actions } = createCrudSlice<Role, CreateRoleDto, UpdateRoleDto>({
  name: 'role',
  api: {
    findAll: rolesControllerFindAll,
    findOne: rolesControllerFindOne,
    create: rolesControllerCreate,
    update: rolesControllerUpdate,
    delete: rolesControllerDelete,
  },
  entityName: '角色',
});

// ============== 额外的异步操作 ==============

// 分配菜单权限
export const assignMenus = createAsyncThunk(
  'role/assignMenus',
  async (
    { roleId, menuIds }: { roleId: string; menuIds: string[] },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = (await rolesControllerAssignMenus({
        path: { id: roleId },
        body: { menuIds },
      })) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(thunks.fetchById(roleId));
        dispatch(thunks.fetchList({}));
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '分配菜单权限失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新角色菜单权限 (别名)
export const updateRoleMenus = assignMenus;

// ============== 导出 ==============

// 导出通用 thunks（保持向后兼容的命名）
export const fetchRoles = thunks.fetchList;
export const fetchRoleById = thunks.fetchById;
export const createRole = thunks.create;
export const updateRole = (params: { id: string; roleData: Partial<Role> }) =>
  thunks.update({ id: params.id, data: params.roleData });
export const deleteRole = thunks.remove;

// 导出 actions（保持向后兼容的命名）
export const {
  clearError,
  setSearchKeyword,
  setPagination,
  clearCurrentItem: clearCurrentRole,
} = actions;

// 为了兼容性，导出 setFilters
export const setFilters = actions.setFilters;

// 导出 State 类型
export type RoleState = CrudState<Role>;

// 兼容性：选择器辅助函数
export const selectRoles = (state: { role: RoleState }) => state.role.items;
export const selectCurrentRole = (state: { role: RoleState }) => state.role.currentItem;
export const selectRoleLoading = (state: { role: RoleState }) => state.role.loading;
export const selectRolePagination = (state: { role: RoleState }) => state.role.pagination;

export default slice.reducer;
