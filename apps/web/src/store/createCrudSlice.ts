import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
  AsyncThunk,
} from '@reduxjs/toolkit';
import { ListResponse, PaginationParams, ApiResponse } from '../types';
import type { RootState } from './index';

// ============== 类型定义 ==============

/** 基础实体类型，必须有 id */
interface BaseEntity {
  id: string;
}

/** 通用 CRUD State 结构 */
export interface CrudState<T> {
  items: T[];
  currentItem: T | null;
  pagination: PaginationParams;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  filters: Record<string, unknown>;
}

/** 查询参数类型 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  filters?: Record<string, unknown>;
}

/** API 方法定义 - 使用宽松类型以兼容 OpenAPI 生成的客户端 */
export interface CrudApiMethods<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  findAll: (params: { query: QueryParams }) => Promise<unknown>;
  findOne: (params: { path: { id: string } }) => Promise<unknown>;
  create: (params: { body: TCreate }) => Promise<unknown>;
  update: (params: { path: { id: string }; body: TUpdate }) => Promise<unknown>;
  delete: (params: { path: { id: string } }) => Promise<unknown>;
  batchDelete?: (params: { body: { ids: string[] } }) => Promise<unknown>;
}

/** 工厂配置 */
export interface CreateCrudSliceConfig<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /** slice 名称 */
  name: string;
  /** API 方法 */
  api: CrudApiMethods<T, TCreate, TUpdate>;
  /** 实体名称（用于错误消息） */
  entityName: string;
  /** 额外的 reducers */
  extraReducers?: (builder: ActionReducerMapBuilder<CrudState<T>>) => void;
  /** 额外的同步 reducers */
  reducers?: Record<string, (state: CrudState<T>, action: PayloadAction<unknown>) => void>;
  /** 初始 filters */
  initialFilters?: Record<string, unknown>;
  /** 操作成功后是否自动刷新列表，默认 true */
  autoRefreshOnMutate?: boolean;
}

/** 返回的 Thunks 类型 */
export interface CrudThunks<T> {
  fetchList: AsyncThunk<ListResponse<T>, QueryParams, { rejectValue: string }>;
  fetchById: AsyncThunk<T, string, { rejectValue: string }>;
  create: AsyncThunk<T, Partial<T>, { rejectValue: string }>;
  update: AsyncThunk<T, { id: string; data: Partial<T> }, { rejectValue: string }>;
  remove: AsyncThunk<string, string, { rejectValue: string }>;
  batchRemove: AsyncThunk<string[], string[], { rejectValue: string }>;
}

// ============== 工厂函数 ==============

/**
 * 创建通用 CRUD Slice
 *
 * @example
 * ```ts
 * const { slice, thunks } = createCrudSlice({
 *   name: 'user',
 *   api: {
 *     findAll: usersControllerFindAll,
 *     findOne: usersControllerFindOne,
 *     create: usersControllerCreate,
 *     update: usersControllerUpdate,
 *     delete: usersControllerDelete,
 *     batchDelete: usersControllerBatchDelete,
 *   },
 *   entityName: '用户',
 * });
 *
 * export const { fetchList, fetchById, create, update, remove, batchRemove } = thunks;
 * export const { clearError, setSearchKeyword, setFilters, setPagination, clearCurrentItem } = slice.actions;
 * export default slice.reducer;
 * ```
 */
export function createCrudSlice<T extends BaseEntity, TCreate = Partial<T>, TUpdate = Partial<T>>(
  config: CreateCrudSliceConfig<T, TCreate, TUpdate>
) {
  const {
    name,
    api,
    entityName,
    extraReducers: customExtraReducers,
    reducers: customReducers,
    initialFilters = {},
    autoRefreshOnMutate = true,
  } = config;

  // 初始状态
  const initialState: CrudState<T> = {
    items: [],
    currentItem: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    loading: false,
    error: null,
    searchKeyword: '',
    filters: initialFilters,
  };

  /** 从 RootState 获取当前 slice 的查询参数 */
  const getQueryParamsFromState = (rootState: RootState): QueryParams => {
    const state = rootState[name as keyof RootState] as unknown as CrudState<T>;
    return {
      page: state.pagination.page,
      pageSize: state.pagination.pageSize,
      keyword: state.searchKeyword || undefined,
      filters: Object.keys(state.filters).length > 0 ? state.filters : undefined,
    };
  };

  // ============== 创建 AsyncThunks ==============

  // 获取列表
  const fetchList = createAsyncThunk<ListResponse<T>, QueryParams, { rejectValue: string }>(
    `${name}/fetchList`,
    async (params = {}, { rejectWithValue }) => {
      try {
        // 将 filters 对象中的字段展平到 query 参数中，以匹配 API 期望的格式
        const { filters, ...restParams } = params;
        const queryParams = {
          ...restParams,
          ...(filters || {}),
        };
        const response = await api.findAll({ query: queryParams }) as ApiResponse<ListResponse<T>>;
        if (response.success) {
          return response.data;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `获取${entityName}列表失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  // 获取详情
  const fetchById = createAsyncThunk<T, string, { rejectValue: string }>(
    `${name}/fetchById`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await api.findOne({ path: { id } }) as ApiResponse<T>;
        if (response.success) {
          return response.data;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `获取${entityName}详情失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  // 创建
  const create = createAsyncThunk<T, Partial<T>, { rejectValue: string; state: RootState }>(
    `${name}/create`,
    async (data, { rejectWithValue, dispatch, getState }) => {
      try {
        const response = await api.create({ body: data as TCreate }) as ApiResponse<T>;
        if (response.success) {
          if (autoRefreshOnMutate) {
            const queryParams = getQueryParamsFromState(getState());
            dispatch(fetchList(queryParams));
          }
          return response.data;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `创建${entityName}失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  // 更新
  const update = createAsyncThunk<T, { id: string; data: Partial<T> }, { rejectValue: string; state: RootState }>(
    `${name}/update`,
    async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
      try {
        const response = await api.update({ path: { id }, body: data as TUpdate }) as ApiResponse<T>;
        if (response.success) {
          if (autoRefreshOnMutate) {
            const queryParams = getQueryParamsFromState(getState());
            dispatch(fetchList(queryParams));
          }
          return response.data;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `更新${entityName}失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  // 删除
  const remove = createAsyncThunk<string, string, { rejectValue: string; state: RootState }>(
    `${name}/remove`,
    async (id, { rejectWithValue, dispatch, getState }) => {
      try {
        const response = await api.delete({ path: { id } }) as ApiResponse<null>;
        if (response.success) {
          if (autoRefreshOnMutate) {
            const queryParams = getQueryParamsFromState(getState());
            dispatch(fetchList(queryParams));
          }
          return id;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `删除${entityName}失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  // 批量删除
  const batchRemove = createAsyncThunk<string[], string[], { rejectValue: string; state: RootState }>(
    `${name}/batchRemove`,
    async (ids, { rejectWithValue, dispatch, getState }) => {
      try {
        if (!api.batchDelete) {
          return rejectWithValue('批量删除功能未实现');
        }
        const response = await api.batchDelete({ body: { ids } }) as ApiResponse<null>;
        if (response.success) {
          if (autoRefreshOnMutate) {
            const queryParams = getQueryParamsFromState(getState());
            dispatch(fetchList(queryParams));
          }
          return ids;
        }
        return rejectWithValue(response.message);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : `批量删除${entityName}失败`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  const thunks: CrudThunks<T> = {
    fetchList,
    fetchById,
    create,
    update,
    remove,
    batchRemove,
  };

  // ============== 创建 Slice ==============

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearError: (state) => {
        state.error = null;
      },
      setSearchKeyword: (state, action: PayloadAction<string>) => {
        state.searchKeyword = action.payload;
      },
      setFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
        state.filters = action.payload;
      },
      setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
        state.pagination = { ...state.pagination, ...action.payload };
      },
      clearCurrentItem: (state) => {
        state.currentItem = null;
      },
      resetState: () => initialState,
      ...customReducers,
    },
    extraReducers: (builder) => {
      // 获取列表
      builder
        .addCase(fetchList.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchList.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload.list as typeof state.items;
          state.pagination = action.payload.pagination;
        })
        .addCase(fetchList.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 获取详情
      builder
        .addCase(fetchById.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchById.fulfilled, (state, action) => {
          state.loading = false;
          state.currentItem = action.payload as typeof state.currentItem;
        })
        .addCase(fetchById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 创建
      builder
        .addCase(create.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(create.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(create.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 更新
      builder
        .addCase(update.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(update.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(update.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 删除
      builder
        .addCase(remove.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(remove.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(remove.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 批量删除
      builder
        .addCase(batchRemove.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(batchRemove.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(batchRemove.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? null;
        });

      // 调用自定义 extraReducers
      customExtraReducers?.(builder);
    },
  });

  return {
    slice,
    thunks,
    initialState,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}

// 导出类型
export type { BaseEntity };
