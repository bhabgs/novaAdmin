import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role, Permission, ListResponse, PaginationParams } from '../../types';
import { roleApi } from '../../api/role';

interface RoleState {
  roles: Role[];
  permissions: Permission[];
  currentRole: Role | null;
  pagination: PaginationParams;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
}

const initialState: RoleState = {
  roles: [],
  permissions: [],
  currentRole: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
  searchKeyword: '',
};

// 获取角色列表
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await roleApi.getRoles(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取角色列表失败');
    }
  }
);

// 获取权限列表
export const fetchPermissions = createAsyncThunk(
  'role/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleApi.getPermissions();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取权限列表失败');
    }
  }
);

// 获取角色详情
export const fetchRoleById = createAsyncThunk(
  'role/fetchRoleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await roleApi.getRoleById(id);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取角色详情失败');
    }
  }
);

// 创建角色
export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData: Partial<Role>, { rejectWithValue, dispatch }) => {
    try {
      const response = await roleApi.createRole(roleData);
      if (response.success) {
        // 创建成功后刷新列表
        dispatch(fetchRoles());
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '创建角色失败');
    }
  }
);

// 更新角色
export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, roleData }: { id: string; roleData: Partial<Role> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await roleApi.updateRole(id, roleData);
      if (response.success) {
        // 更新成功后刷新列表
        dispatch(fetchRoles());
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '更新角色失败');
    }
  }
);

// 删除角色
export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await roleApi.deleteRole(id);
      if (response.success) {
        // 删除成功后刷新列表
        dispatch(fetchRoles());
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '删除角色失败');
    }
  }
);

// 分配权限
export const assignPermissions = createAsyncThunk(
  'role/assignPermissions',
  async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }, { rejectWithValue, dispatch }) => {
    try {
      const response = await roleApi.assignPermissions(roleId, permissionIds);
      if (response.success) {
        // 分配成功后刷新角色详情
        dispatch(fetchRoleById(roleId));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '分配权限失败');
    }
  }
);

// 更新角色权限 (别名)
export const updateRolePermissions = assignPermissions;

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    // 获取角色列表
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.list;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取权限列表
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取角色详情
    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建角色
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新角色
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除角色
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 分配权限
    builder
      .addCase(assignPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignPermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchKeyword,
  setPagination,
  clearCurrentRole,
} = roleSlice.actions;

export default roleSlice.reducer;