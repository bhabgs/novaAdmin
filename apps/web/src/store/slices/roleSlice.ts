import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  rolesControllerFindAll,
  rolesControllerCreate,
  rolesControllerUpdate,
  rolesControllerRemove,
} from '@/api/services.gen';
import type { Role, ListQueryParams } from '@/types';

interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  status?: number;
  sort?: number;
  menuIds?: string[];
}

interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  status?: number;
  sort?: number;
  menuIds?: string[];
}

interface RoleState {
  list: Role[];
  current: Role | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; pageSize: number; total: number };
}

const initialState: RoleState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: 10, total: 0 },
};

export const fetchRoles = createAsyncThunk('role/fetchList', async (params?: ListQueryParams) => {
  const response = await rolesControllerFindAll({ query: params });
  return response.data?.data || response.data;
});

export const createRole = createAsyncThunk('role/create', async (data: CreateRoleDto) => {
  const response = await rolesControllerCreate({ body: data });
  return response.data?.data || response.data;
});

export const updateRole = createAsyncThunk(
  'role/update',
  async ({ id, data }: { id: string; data: UpdateRoleDto }) => {
    const response = await rolesControllerUpdate({ path: { id }, body: data });
    return response.data?.data || response.data;
  },
);

export const deleteRole = createAsyncThunk('role/delete', async (id: string) => {
  await rolesControllerRemove({ path: { id } });
  return id;
});

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Role | null>) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取角色列表失败';
      })
      .addCase(createRole.rejected, (state, action) => {
        state.error = action.error.message || '创建角色失败';
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.error.message || '更新角色失败';
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.error.message || '删除角色失败';
      });
  },
});

export const { setCurrent, clearError } = roleSlice.actions;
export default roleSlice.reducer;
