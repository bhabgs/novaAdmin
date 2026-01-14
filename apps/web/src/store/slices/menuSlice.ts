import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  menusControllerFindAll,
  menusControllerCreate,
  menusControllerUpdate,
  menusControllerRemove,
} from '@/api/services.gen';
import type { Menu } from '@/types';

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
  tree: Menu[];
  current: Menu | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  tree: [],
  current: null,
  loading: false,
  error: null,
};

// 递归排序菜单树（按 sort 字段升序）
const sortMenuTree = (menus: Menu[]): Menu[] => {
  if (!Array.isArray(menus)) return menus;

  return menus
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((menu) => ({
      ...menu,
      children: menu.children ? sortMenuTree(menu.children) : undefined,
    }));
};

export const fetchMenus = createAsyncThunk('menu/fetchTree', async () => {
  const response = await menusControllerFindAll();
  const data = response.data?.data || response.data;
  return sortMenuTree(data);
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
    setCurrent: (state, action: PayloadAction<Menu | null>) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取菜单列表失败';
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.error = action.error.message || '创建菜单失败';
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.error = action.error.message || '更新菜单失败';
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.error = action.error.message || '删除菜单失败';
      });
  },
});

export const { setCurrent, clearError } = menuSlice.actions;
export default menuSlice.reducer;
