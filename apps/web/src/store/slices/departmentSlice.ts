import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '@/utils/request';

interface DepartmentState {
  tree: any[];
  current: any | null;
  loading: boolean;
}

const initialState: DepartmentState = {
  tree: [],
  current: null,
  loading: false,
};

export const fetchDepartments = createAsyncThunk('department/fetchTree', async () => {
  const response = await request.get('/api/rbac/departments');
  return response.data;
});

export const createDepartment = createAsyncThunk('department/create', async (data: any) => {
  const response = await request.post('/api/rbac/departments', data);
  return response.data;
});

export const updateDepartment = createAsyncThunk('department/update', async ({ id, data }: { id: string; data: any }) => {
  const response = await request.put(`/api/rbac/departments/${id}`, data);
  return response.data;
});

export const deleteDepartment = createAsyncThunk('department/delete', async (id: string) => {
  await request.delete(`/api/rbac/departments/${id}`);
  return id;
});

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setCurrent: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => { state.loading = true; })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state) => { state.loading = false; });
  },
});

export const { setCurrent } = departmentSlice.actions;
export default departmentSlice.reducer;
