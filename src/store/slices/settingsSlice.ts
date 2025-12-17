import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemSettings, ThemeConfig, Language, LayoutConfig } from '../../types';
import i18n from '../../i18n';

const SETTINGS_KEY = 'nova_admin_settings';

// 默认设置
const defaultSettings: SystemSettings = {
  theme: {
    mode: 'light',
    primaryColor: '#1890ff',
    borderRadius: 6,
  },
  language: 'zh-CN',
  layout: {
    mode: 'side',
    sidebarCollapsed: false,
    sidebarWidth: 220,
    sidebarTheme: 'dark',
    headerHeight: 64,
    fixedHeader: true,
    showTabs: true,
    contentWidth: 'fluid',
    showFooter: false,
  },
};

// 从localStorage获取设置
const getStoredSettings = (): SystemSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to parse stored settings:', error);
  }
  return defaultSettings;
};

// 保存设置到localStorage
const saveSettings = (settings: SystemSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

interface SettingsState extends SystemSettings {
  loading: boolean;
}

const initialState: SettingsState = {
  ...getStoredSettings(),
  loading: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 更新主题设置
    updateTheme: (state, action: PayloadAction<Partial<ThemeConfig>>) => {
      state.theme = { ...state.theme, ...action.payload };
      saveSettings(state);
    },

    // 切换主题模式
    toggleThemeMode: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
      saveSettings(state);
    },

    // 更新语言设置
    updateLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      saveSettings(state);
      // 同步到i18n
      i18n.changeLanguage(action.payload);
    },

    // 切换侧边栏折叠状态
    toggleSidebar: (state) => {
      state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
      saveSettings(state);
    },

    // 设置侧边栏折叠状态
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.layout.sidebarCollapsed = action.payload;
      saveSettings(state);
    },

    // 更新布局设置
    updateLayout: (state, action: PayloadAction<Partial<SystemSettings['layout']>>) => {
      state.layout = { ...state.layout, ...action.payload };
      saveSettings(state);
    },

    // 重置设置
    resetSettings: (state) => {
      Object.assign(state, defaultSettings);
      saveSettings(state);
      // 同步语言到i18n
      i18n.changeLanguage(defaultSettings.language);
    },

    // 批量更新设置
    updateSettings: (state, action: PayloadAction<Partial<SystemSettings>>) => {
      Object.assign(state, action.payload);
      saveSettings(state);
      // 如果更新了语言，同步到i18n
      if (action.payload.language) {
        i18n.changeLanguage(action.payload.language);
      }
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 初始化设置（用于应用启动时同步状态）
    initializeSettings: (state) => {
      // 同步当前语言到i18n
      i18n.changeLanguage(state.language);
    },
  },
});

export const {
  updateTheme,
  toggleThemeMode,
  updateLanguage,
  toggleSidebar,
  setSidebarCollapsed,
  updateLayout,
  resetSettings,
  updateSettings,
  setLoading,
  initializeSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;