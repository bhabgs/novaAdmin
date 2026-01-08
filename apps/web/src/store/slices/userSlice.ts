import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '@/api/services';

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
  list: any[];
  current: any | null;
  loading: boolean;
  pagination: { page: number; pageSize: number; total: number };
}

const initialState: UserState = {
  list: [],
  current: null,
  loading: false,
  pagination: { page: 1, pageSize: 10, total: 0 },
};

export const fetchUsers = createAsyncThunk('user/fetchList', async (params?: any) => {
  const response = await usersApi.findAll(params);
  return response.data;
});

export const createUser = createAsyncThunk('user/create', async (data: CreateUserDto) => {
  const response = await usersApi.create(data);
  return response.data;
});

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ id, data }: { id: string; data: UpdateUserDto }) => {
    const response = await usersApi.update(id, data);
    return response.data;
  },
);

export const deleteUser = createAsyncThunk('user/delete', async (id: string) => {
  await usersApi.remove(id);
  return id;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrent } = userSlice.actions;
export default userSlice.reducer;
