import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Menu } from "../../types/menu";
import { ApiResponse } from "../../types";
import {
  menusControllerFindAll,
  menusControllerFindTree,
  menusControllerFindOne,
  menusControllerCreate,
  menusControllerUpdate,
  menusControllerDelete,
  menusControllerBatchDelete,
  menusControllerUpdateSort,
  type CreateMenuDto,
  type UpdateMenuDto,
} from "../../api";

interface MenuState {
  menus: Menu[];
  userMenus: Menu[];
  currentMenu: Menu | null;
  loading: boolean;
  error: string | null;
  expandedKeys: string[];
  selectedKeys: string[];
}

const initialState: MenuState = {
  menus: [],
  userMenus: [],
  currentMenu: null,
  loading: false,
  error: null,
  expandedKeys: [],
  selectedKeys: [],
};

// 获取所有菜单（管理用）
export const fetchMenus = createAsyncThunk(
  "menu/fetchMenus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await menusControllerFindAll() as unknown as ApiResponse<Menu[]>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "获取菜单列表失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 获取用户菜单（导航用）- 使用菜单树接口
export const fetchUserMenus = createAsyncThunk(
  "menu/fetchUserMenus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await menusControllerFindTree() as unknown as ApiResponse<Menu[]>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "获取用户菜单失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 获取菜单详情
export const fetchMenuById = createAsyncThunk(
  "menu/fetchMenuById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await menusControllerFindOne({ path: { id } }) as unknown as ApiResponse<Menu>;
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "获取菜单详情失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 创建菜单
export const createMenu = createAsyncThunk(
  "menu/createMenu",
  async (menuData: Partial<Menu>, { rejectWithValue, dispatch }) => {
    try {
      const response = await menusControllerCreate({ body: menuData as CreateMenuDto }) as unknown as ApiResponse<Menu>;
      if (response.success) {
        dispatch(fetchMenus());
        dispatch(fetchUserMenus());
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "创建菜单失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新菜单
export const updateMenu = createAsyncThunk(
  "menu/updateMenu",
  async (
    { id, menuData }: { id: string; menuData: Partial<Menu> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await menusControllerUpdate({
        path: { id },
        body: menuData as UpdateMenuDto
      }) as unknown as ApiResponse<Menu>;
      if (response.success) {
        dispatch(fetchMenus());
        dispatch(fetchUserMenus());
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "更新菜单失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 删除菜单
export const deleteMenu = createAsyncThunk(
  "menu/deleteMenu",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await menusControllerDelete({ path: { id } }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchMenus());
        dispatch(fetchUserMenus());
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "删除菜单失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 批量删除菜单
export const batchDeleteMenus = createAsyncThunk(
  "menu/batchDeleteMenus",
  async (ids: string[], { rejectWithValue, dispatch }) => {
    try {
      const response = await menusControllerBatchDelete({ body: { ids } }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchMenus());
        dispatch(fetchUserMenus());
        return ids;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "批量删除菜单失败";
      return rejectWithValue(errorMessage);
    }
  }
);

// 更新菜单排序
export const updateMenuSort = createAsyncThunk(
  "menu/updateMenuSort",
  async (menuList: Menu[], { rejectWithValue, dispatch }) => {
    try {
      const response = await menusControllerUpdateSort({
        body: { menus: menuList.map(m => m.id) }
      }) as unknown as ApiResponse<null>;
      if (response.success) {
        dispatch(fetchMenus());
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "更新菜单排序失败";
      return rejectWithValue(errorMessage);
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMenu: (state) => {
      state.currentMenu = null;
    },
    setExpandedKeys: (state, action: PayloadAction<string[]>) => {
      state.expandedKeys = action.payload;
    },
    setSelectedKeys: (state, action: PayloadAction<string[]>) => {
      state.selectedKeys = action.payload;
    },
    toggleExpanded: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const index = state.expandedKeys.indexOf(key);
      if (index > -1) {
        state.expandedKeys.splice(index, 1);
      } else {
        state.expandedKeys.push(key);
      }
    },
  },
  extraReducers: (builder) => {
    // 获取所有菜单
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户菜单
    builder
      .addCase(fetchUserMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.userMenus = action.payload;
      })
      .addCase(fetchUserMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取菜单详情
    builder
      .addCase(fetchMenuById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMenu = action.payload;
      })
      .addCase(fetchMenuById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建菜单
    builder
      .addCase(createMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenu.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新菜单
    builder
      .addCase(updateMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenu.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除菜单
    builder
      .addCase(deleteMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenu.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新菜单排序
    builder
      .addCase(updateMenuSort.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuSort.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateMenuSort.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentMenu,
  setExpandedKeys,
  setSelectedKeys,
  toggleExpanded,
} = menuSlice.actions;

export default menuSlice.reducer;
