import { I18nModule } from '../../types/i18n';
import { createCrudSlice } from '../createCrudSlice';
import {
  i18nModulesControllerFindAll,
  i18nModulesControllerFindOne,
  i18nModulesControllerCreate,
  i18nModulesControllerUpdate,
  i18nModulesControllerDelete,
  i18nModulesControllerBatchDelete,
  type CreateI18nModuleDto,
  type UpdateI18nModuleDto,
} from '../../api';

// 使用工厂函数创建基础 CRUD slice
const { slice, thunks, actions } = createCrudSlice<I18nModule, CreateI18nModuleDto, UpdateI18nModuleDto>({
  name: 'i18nModule',
  api: {
    findAll: i18nModulesControllerFindAll,
    findOne: i18nModulesControllerFindOne,
    create: i18nModulesControllerCreate,
    update: i18nModulesControllerUpdate,
    delete: i18nModulesControllerDelete,
    batchDelete: i18nModulesControllerBatchDelete,
  },
  entityName: '多语言模块',
  initialFilters: {},
});

// 导出通用 thunks
export const fetchI18nModules = thunks.fetchList;
export const fetchI18nModuleById = thunks.fetchById;
export const createI18nModule = thunks.create;
export const updateI18nModule = (params: { id: string; data: Partial<I18nModule> }) =>
  thunks.update({ id: params.id, data: params.data });
export const deleteI18nModule = thunks.remove;
export const batchDeleteI18nModules = thunks.batchRemove;

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

