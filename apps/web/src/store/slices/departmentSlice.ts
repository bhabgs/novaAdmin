import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  departmentsControllerFindAll,
  departmentsControllerCreate,
  departmentsControllerUpdate,
  departmentsControllerRemove,
} from '@/api/services.gen';

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
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrent } = departmentSlice.actions;
export default departmentSlice.reducer;
