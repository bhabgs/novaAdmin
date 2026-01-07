import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '@/utils/request';

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

export const fetchRoles = createAsyncThunk('role/fetchList', async (params: any) => {
  const response = await request.get('/api/rbac/roles', { params });
  return response.data;
});

export const createRole = createAsyncThunk('role/create', async (data: any) => {
  const response = await request.post('/api/rbac/roles', data);
  return response.data;
});

export const updateRole = createAsyncThunk('role/update', async ({ id, data }: { id: string; data: any }) => {
  const response = await request.put(`/api/rbac/roles/${id}`, data);
  return response.data;
});

export const deleteRole = createAsyncThunk('role/delete', async (id: string) => {
  await request.delete(`/api/rbac/roles/${id}`);
  return id;
});

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setCurrent: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchRoles.rejected, (state) => { state.loading = false; });
  },
});

export const { setCurrent } = roleSlice.actions;
export default roleSlice.reducer;
