import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import request from '@/utils/request';

interface MenuState {
  tree: any[];
  current: any | null;
  loading: boolean;
}

const initialState: MenuState = {
  tree: [],
  current: null,
  loading: false,
};

export const fetchMenus = createAsyncThunk('menu/fetchTree', async () => {
  const response = await request.get('/api/rbac/menus');
  return response.data;
});

export const createMenu = createAsyncThunk('menu/create', async (data: any) => {
  const response = await request.post('/api/rbac/menus', data);
  return response.data;
});

export const updateMenu = createAsyncThunk('menu/update', async ({ id, data }: { id: string; data: any }) => {
  const response = await request.put(`/api/rbac/menus/${id}`, data);
  return response.data;
});

export const deleteMenu = createAsyncThunk('menu/delete', async (id: string) => {
  await request.delete(`/api/rbac/menus/${id}`);
  return id;
});

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCurrent: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => { state.loading = true; })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchMenus.rejected, (state) => { state.loading = false; });
  },
});

export const { setCurrent } = menuSlice.actions;
export default menuSlice.reducer;
