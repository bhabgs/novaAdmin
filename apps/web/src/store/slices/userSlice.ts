import { createAsyncThunk } from '@reduxjs/toolkit';
import { User, ApiResponse } from '../../types';
import {
  usersControllerFindAll,
  usersControllerFindOne,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerDelete,
  usersControllerBatchDelete,
  usersControllerResetPassword,
  type CreateUserDto,
  type UpdateUserDto,
} from '../../api';
import { createCrudSlice, CrudState } from '../createCrudSlice';

// 扩展的 State 类型（包含额外的 filters）
export interface UserState extends CrudState<User> {
  filters: {
    status?: string;
    role?: string;
  };
}

// 使用工厂函数创建基础 CRUD slice
const { slice, thunks, actions } = createCrudSlice<User, CreateUserDto, UpdateUserDto>({
  name: 'user',
  api: {
    findAll: usersControllerFindAll,
    findOne: usersControllerFindOne,
    create: usersControllerCreate,
    update: usersControllerUpdate,
    delete: usersControllerDelete,
    batchDelete: usersControllerBatchDelete,
  },
  entityName: '用户',
  initialFilters: {
    status: undefined,
    role: undefined,
  },
});

// ============== 额外的异步操作 ==============

// 重置用户密码
export const resetUserPassword = createAsyncThunk(
  'user/resetUserPassword',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = (await usersControllerResetPassword({
        path: { id },
      })) as unknown as ApiResponse<{ password: string }>;
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '重置密码失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新用户状态
export const updateUserStatus = createAsyncThunk(
  'user/updateUserStatus',
  async (
    { id, status }: { id: string; status: 'active' | 'inactive' | 'banned' },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = (await usersControllerUpdate({
        path: { id },
        body: { status } as UpdateUserDto,
      })) as unknown as ApiResponse<User>;
      if (response.success) {
        dispatch(thunks.fetchList({}));
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新用户状态失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============== 导出 ==============

// 导出通用 thunks（保持向后兼容的命名）
export const fetchUsers = thunks.fetchList;
export const fetchUserById = thunks.fetchById;
export const createUser = thunks.create;
export const updateUser = (params: { id: string; userData: Partial<User> }) =>
  thunks.update({ id: params.id, data: params.userData });
export const deleteUser = thunks.remove;
export const batchDeleteUsers = thunks.batchRemove;

// 导出 actions（保持向后兼容的命名）
export const {
  clearError,
  setSearchKeyword,
  setFilters,
  setPagination,
  clearCurrentItem: clearCurrentUser,
} = actions;

// 兼容性：选择器辅助函数
export const selectUsers = (state: { user: UserState }) => state.user.items;
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentItem;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserPagination = (state: { user: UserState }) => state.user.pagination;

export default slice.reducer;
