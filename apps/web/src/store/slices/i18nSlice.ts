import { I18n } from '../../types/i18n';
import { createCrudSlice } from '../createCrudSlice';
import {
  i18nControllerFindAll,
  i18nControllerFindOne,
  i18nControllerCreate,
  i18nControllerUpdate,
  i18nControllerDelete,
  i18nControllerBatchDelete,
  type CreateI18nDto,
  type UpdateI18nDto,
} from '../../api';

// 扩展的 State 类型
export interface I18nState {
  items: I18n[];
  currentItem: I18n | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  filters: {
    moduleId?: string;
  };
}

// 使用工厂函数创建基础 CRUD slice
const { slice, thunks, actions } = createCrudSlice<I18n, CreateI18nDto, UpdateI18nDto>({
  name: 'i18n',
  api: {
    findAll: i18nControllerFindAll,
    findOne: i18nControllerFindOne,
    create: i18nControllerCreate,
    update: i18nControllerUpdate,
    delete: i18nControllerDelete,
    batchDelete: i18nControllerBatchDelete,
  },
  entityName: '多语言',
  initialFilters: {
    moduleId: undefined,
  },
});

// 导出通用 thunks
export const fetchI18ns = thunks.fetchList;
export const fetchI18nById = thunks.fetchById;
export const createI18n = thunks.create;
export const updateI18n = (params: { id: string; data: Partial<I18n> }) =>
  thunks.update({ id: params.id, data: params.data });
export const deleteI18n = thunks.remove;
export const batchDeleteI18ns = thunks.batchRemove;

// 导出 actions
export const {
  clearError,
  setSearchKeyword,
  setFilters,
  setPagination,
  clearCurrentItem,
  resetState,
} = actions;

// 导出 reducer
export default slice.reducer;

