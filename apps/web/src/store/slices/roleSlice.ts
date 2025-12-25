import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role, ListResponse, PaginationParams, ApiResponse } from '../../types';
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

interface RoleState {
  roles: Role[];
  currentRole: Role | null;
  pagination: PaginationParams;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
}

const initialState: RoleState = {
  roles: [],
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
      const response = await rolesControllerFindAll({ query: params }) as unknown as ApiResponse<ListResponse<Role>>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取角色列表失败';
      return rejectWithValue(errorMessage);
    }
  }
);


// 获取角色详情
export const fetchRoleById = createAsyncThunk(
  'role/fetchRoleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rolesControllerFindOne({ path: { id } }) as unknown as ApiResponse<Role>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取角色详情失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 创建角色
export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData: Partial<Role>, { rejectWithValue, dispatch }) => {
    try {
      const response = await rolesControllerCreate({ body: roleData as CreateRoleDto }) as unknown as ApiResponse<Role>;
      if (response.success) {
        dispatch(fetchRoles({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建角色失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新角色
export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, roleData }: { id: string; roleData: Partial<Role> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await rolesControllerUpdate({ path: { id }, body: roleData as UpdateRoleDto }) as unknown as ApiResponse<Role>;
      if (response.success) {
        dispatch(fetchRoles({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新角色失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 删除角色
export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await rolesControllerDelete({ path: { id } }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchRoles({}));
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '删除角色失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 分配菜单权限
export const assignMenus = createAsyncThunk(
  'role/assignMenus',
  async ({ roleId, menuIds }: { roleId: string; menuIds: string[] }, { rejectWithValue, dispatch }) => {
    try {
      const response = await rolesControllerAssignMenus({
        path: { id: roleId },
        body: { menuIds }
      }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchRoleById(roleId));
        dispatch(fetchRoles({}));
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '分配菜单权限失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新角色菜单权限 (别名)
export const updateRoleMenus = assignMenus;

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

    // 分配菜单权限
    builder
      .addCase(assignMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignMenus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignMenus.rejected, (state, action) => {
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
