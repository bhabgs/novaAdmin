import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  menusControllerFindAll,
  menusControllerCreate,
  menusControllerUpdate,
  menusControllerRemove,
} from '@/api/services.gen';

interface CreateMenuDto {
  name: string;
  nameI18n?: string;
  parentId?: string;
  path?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  type: number;
  permission?: string;
  sort?: number;
  visible?: boolean;
  status?: number;
}

interface UpdateMenuDto {
  name?: string;
  nameI18n?: string;
  parentId?: string;
  path?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  type?: number;
  permission?: string;
  sort?: number;
  visible?: boolean;
  status?: number;
}

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
  const response = await menusControllerFindAll();
  return response.data?.data || response.data;
});

export const createMenu = createAsyncThunk('menu/create', async (data: CreateMenuDto) => {
  const response = await menusControllerCreate({ body: data });
  return response.data?.data || response.data;
});

export const updateMenu = createAsyncThunk(
  'menu/update',
  async ({ id, data }: { id: string; data: UpdateMenuDto }) => {
    const response = await menusControllerUpdate({ path: { id }, body: data });
    return response.data?.data || response.data;
  },
);

export const deleteMenu = createAsyncThunk('menu/delete', async (id: string) => {
  await menusControllerRemove({ path: { id } });
  return id;
});

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchMenus.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrent } = menuSlice.actions;
export default menuSlice.reducer;
