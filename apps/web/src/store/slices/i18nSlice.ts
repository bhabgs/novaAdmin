import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  I18nTranslation,
  I18nTranslationListResponse,
  CreateI18nTranslationDto,
  UpdateI18nTranslationDto,
  QueryI18nTranslationParams,
  BatchDeleteDto,
  BatchImportDto,
  BatchImportResponse,
  ModuleListResponse,
} from '../../types/i18n';

const API_BASE_URL = '/api/i18n';

// Async Thunks
export const fetchI18nTranslations = createAsyncThunk(
  'i18n/fetchTranslations',
  async (params: QueryI18nTranslationParams) => {
    const response = await axios.get<{ data: I18nTranslationListResponse }>(API_BASE_URL, {
      params,
    });
    return response.data.data;
  },
);

export const fetchI18nModules = createAsyncThunk(
  'i18n/fetchModules',
  async () => {
    const response = await axios.get<{ data: ModuleListResponse }>(`${API_BASE_URL}/modules`);
    return response.data.data;
  },
);

export const fetchI18nTranslationById = createAsyncThunk(
  'i18n/fetchTranslationById',
  async (id: string) => {
    const response = await axios.get<{ data: I18nTranslation }>(`${API_BASE_URL}/${id}`);
    return response.data.data;
  },
);

export const createI18nTranslation = createAsyncThunk(
  'i18n/createTranslation',
  async (dto: CreateI18nTranslationDto) => {
    const response = await axios.post<{ data: I18nTranslation }>(API_BASE_URL, dto);
    return response.data.data;
  },
);

export const updateI18nTranslation = createAsyncThunk(
  'i18n/updateTranslation',
  async ({ id, dto }: { id: string; dto: UpdateI18nTranslationDto }) => {
    const response = await axios.patch<{ data: I18nTranslation }>(`${API_BASE_URL}/${id}`, dto);
    return response.data.data;
  },
);

export const deleteI18nTranslation = createAsyncThunk(
  'i18n/deleteTranslation',
  async (id: string) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id;
  },
);

export const batchDeleteI18nTranslations = createAsyncThunk(
  'i18n/batchDeleteTranslations',
  async (dto: BatchDeleteDto) => {
    const response = await axios.post<{ data: { deleted: number } }>(
      `${API_BASE_URL}/batch-delete`,
      dto,
    );
    return response.data.data.deleted;
  },
);

export const importI18nTranslations = createAsyncThunk(
  'i18n/importTranslations',
  async (dto: BatchImportDto) => {
    const response = await axios.post<{ data: BatchImportResponse }>(
      `${API_BASE_URL}/import/json`,
      dto,
    );
    return response.data.data;
  },
);

export const exportI18nTranslations = createAsyncThunk(
  'i18n/exportTranslations',
  async (language: string) => {
    const response = await axios.get<{ data: Record<string, any> }>(
      `${API_BASE_URL}/export/json/${language}`,
    );
    return response.data.data;
  },
);

interface I18nState {
  translations: I18nTranslation[];
  modules: string[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  currentTranslation: I18nTranslation | null;
  loading: boolean;
  error: string | null;
}

const initialState: I18nState = {
  translations: [],
  modules: [],
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
  },
  currentTranslation: null,
  loading: false,
  error: null,
};

const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentTranslation: state => {
      state.currentTranslation = null;
    },
  },
  extraReducers: builder => {
    // Fetch translations
    builder.addCase(fetchI18nTranslations.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchI18nTranslations.fulfilled,
      (state, action: PayloadAction<I18nTranslationListResponse>) => {
        state.loading = false;
        state.translations = action.payload.list;
        state.pagination = action.payload.pagination;
      },
    );
    builder.addCase(fetchI18nTranslations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch translations';
    });

    // Fetch modules
    builder.addCase(fetchI18nModules.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.modules = action.payload;
    });

    // Fetch translation by id
    builder.addCase(fetchI18nTranslationById.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchI18nTranslationById.fulfilled,
      (state, action: PayloadAction<I18nTranslation>) => {
        state.loading = false;
        state.currentTranslation = action.payload;
      },
    );
    builder.addCase(fetchI18nTranslationById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch translation';
    });

    // Create translation
    builder.addCase(createI18nTranslation.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createI18nTranslation.fulfilled,
      (state, action: PayloadAction<I18nTranslation>) => {
        state.loading = false;
        state.translations.unshift(action.payload);
        state.pagination.total++;
      },
    );
    builder.addCase(createI18nTranslation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create translation';
    });

    // Update translation
    builder.addCase(updateI18nTranslation.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateI18nTranslation.fulfilled,
      (state, action: PayloadAction<I18nTranslation>) => {
        state.loading = false;
        const index = state.translations.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.translations[index] = action.payload;
        }
        if (state.currentTranslation?.id === action.payload.id) {
          state.currentTranslation = action.payload;
        }
      },
    );
    builder.addCase(updateI18nTranslation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update translation';
    });

    // Delete translation
    builder.addCase(deleteI18nTranslation.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteI18nTranslation.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.translations = state.translations.filter(t => t.id !== action.payload);
      state.pagination.total--;
      if (state.currentTranslation?.id === action.payload) {
        state.currentTranslation = null;
      }
    });
    builder.addCase(deleteI18nTranslation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete translation';
    });

    // Batch delete translations
    builder.addCase(batchDeleteI18nTranslations.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      batchDeleteI18nTranslations.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.pagination.total -= action.payload;
      },
    );
    builder.addCase(batchDeleteI18nTranslations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete translations';
    });

    // Import translations
    builder.addCase(importI18nTranslations.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      importI18nTranslations.fulfilled,
      (state, action: PayloadAction<BatchImportResponse>) => {
        state.loading = false;
        // Refetch will be handled by the component
      },
    );
    builder.addCase(importI18nTranslations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to import translations';
    });

    // Export translations
    builder.addCase(exportI18nTranslations.pending, state => {
      state.loading = true;
    });
    builder.addCase(exportI18nTranslations.fulfilled, state => {
      state.loading = false;
      // Data will be handled by the component
    });
    builder.addCase(exportI18nTranslations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to export translations';
    });
  },
});

export const { clearError, clearCurrentTranslation } = i18nSlice.actions;
export default i18nSlice.reducer;
