import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  departmentsControllerFindAll,
  departmentsControllerCreate,
  departmentsControllerUpdate,
  departmentsControllerRemove,
} from '@/api/services.gen';
import type { Department } from '@/types';

interface CreateDepartmentDto {
  name: string;
  code?: string;
  parentId?: string;
  leader?: string;
  phone?: string;
  email?: string;
  status?: number;
  sort?: number;
}

interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  parentId?: string;
  leader?: string;
  phone?: string;
  email?: string;
  status?: number;
  sort?: number;
}

interface DepartmentState {
  tree: Department[];
  current: Department | null;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  tree: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk('department/fetchTree', async () => {
  const response = await departmentsControllerFindAll();
  return response.data?.data || response.data;
});

export const createDepartment = createAsyncThunk(
  'department/create',
  async (data: CreateDepartmentDto) => {
    const response = await departmentsControllerCreate({ body: data });
    return response.data?.data || response.data;
  },
);

export const updateDepartment = createAsyncThunk(
  'department/update',
  async ({ id, data }: { id: string; data: UpdateDepartmentDto }) => {
    const response = await departmentsControllerUpdate({ path: { id }, body: data });
    return response.data?.data || response.data;
  },
);

export const deleteDepartment = createAsyncThunk('department/delete', async (id: string) => {
  await departmentsControllerRemove({ path: { id } });
  return id;
});

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Department | null>) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取部门列表失败';
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.error = action.error.message || '创建部门失败';
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.error = action.error.message || '更新部门失败';
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.error = action.error.message || '删除部门失败';
      });
  },
});

export const { setCurrent, clearError } = departmentSlice.actions;
export default departmentSlice.reducer;
