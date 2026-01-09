import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  usersControllerFindAll,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerRemove,
} from '@/api/services.gen';
import type { User, ListQueryParams } from '@/types';

interface CreateUserDto {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
  departmentId?: string;
  roleIds?: string[];
}

interface UpdateUserDto {
  username?: string;
  password?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
  departmentId?: string;
  roleIds?: string[];
}

interface UserState {
  list: User[];
  current: User | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; pageSize: number; total: number };
}

const initialState: UserState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: 10, total: 0 },
};

export const fetchUsers = createAsyncThunk('user/fetchList', async (params?: ListQueryParams) => {
  const response = await usersControllerFindAll({ query: params });
  return response.data?.data || response.data;
});

export const createUser = createAsyncThunk('user/create', async (data: CreateUserDto) => {
  const response = await usersControllerCreate({ body: data });
  return response.data?.data || response.data;
});

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ id, data }: { id: string; data: UpdateUserDto }) => {
    const response = await usersControllerUpdate({ path: { id }, body: data });
    return response.data?.data || response.data;
  },
);

export const deleteUser = createAsyncThunk('user/delete', async (id: string) => {
  await usersControllerRemove({ path: { id } });
  return id;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<User | null>) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户列表失败';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message || '创建用户失败';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message || '更新用户失败';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.error.message || '删除用户失败';
      });
  },
});

export const { setCurrent, clearError } = userSlice.actions;
export default userSlice.reducer;
