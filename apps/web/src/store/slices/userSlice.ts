import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, ListResponse, PaginationParams, ApiResponse } from '../../types';
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

interface UserState {
  users: User[];
  currentUser: User | null;
  pagination: PaginationParams;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  filters: {
    status?: string;
    role?: string;
  };
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
  searchKeyword: '',
  filters: {},
};

// 获取用户列表
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    filters?: any;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await usersControllerFindAll({ query: params }) as unknown as ApiResponse<ListResponse<User>>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取用户列表失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 获取用户详情
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersControllerFindOne({ path: { id } }) as unknown as ApiResponse<User>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取用户详情失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 创建用户
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Partial<User>, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersControllerCreate({ body: userData as CreateUserDto }) as unknown as ApiResponse<User>;
      if (response.success) {
        dispatch(fetchUsers({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建用户失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新用户
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersControllerUpdate({ path: { id }, body: userData as UpdateUserDto }) as unknown as ApiResponse<User>;
      if (response.success) {
        dispatch(fetchUsers({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新用户失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 删除用户
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await usersControllerDelete({ path: { id } }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchUsers({}));
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '删除用户失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 批量删除用户
export const batchDeleteUsers = createAsyncThunk(
  'user/batchDeleteUsers',
  async (ids: string[], { rejectWithValue, dispatch }) => {
    try {
      const response = await usersControllerBatchDelete({ body: { ids } }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchUsers({}));
        return ids;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '批量删除用户失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 重置用户密码
export const resetUserPassword = createAsyncThunk(
  'user/resetUserPassword',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersControllerResetPassword({ path: { id } }) as unknown as ApiResponse<{ password: string }>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
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
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await usersControllerUpdate({ path: { id }, body: { status } as UpdateUserDto }) as unknown as ApiResponse<User>;
      if (response.success) {
        dispatch(fetchUsers({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新用户状态失败';
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    setFilters: (state, action: PayloadAction<UserState['filters']>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // 获取用户列表
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.list;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户详情
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建用户
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新用户
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除用户
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 批量删除用户
    builder
      .addCase(batchDeleteUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchDeleteUsers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(batchDeleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 重置密码
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新用户状态
    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchKeyword,
  setFilters,
  setPagination,
  clearCurrentUser,
} = userSlice.actions;

export default userSlice.reducer;
