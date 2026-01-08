import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  rolesControllerFindAll,
  rolesControllerCreate,
  rolesControllerUpdate,
  rolesControllerRemove,
} from '@/api/services.gen';

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
  list: any[];
  current: any | null;
  loading: boolean;
  pagination: { page: number; pageSize: number; total: number };
}

const initialState: RoleState = {
  list: [],
  current: null,
  loading: false,
  pagination: { page: 1, pageSize: 10, total: 0 },
};

export const fetchRoles = createAsyncThunk('role/fetchList', async (params?: any) => {
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
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchRoles.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrent } = roleSlice.actions;
export default roleSlice.reducer;
