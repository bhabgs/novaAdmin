import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
  key: string;
  label: string;
  path: string;
  closable?: boolean;
  nameI18n?: string; // 国际化 key，如果存在则优先使用
}

interface TabsState {
  tabs: TabItem[];
  activeKey: string;
  refreshKey: number;
}

const TABS_STORAGE_KEY = 'nova-admin-tabs';

const getInitialState = (): TabsState => {
  try {
    const saved = localStorage.getItem(TABS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        tabs: parsed.tabs || [{ key: '/dashboard', label: '仪表盘', path: '/dashboard', closable: false, nameI18n: 'menu.dashboard' }],
        activeKey: parsed.activeKey || '/dashboard',
        refreshKey: 0,
      };
    }
  } catch (e) {
    console.error('Failed to load tabs from localStorage:', e);
  }
  return {
    tabs: [{ key: '/dashboard', label: '仪表盘', path: '/dashboard', closable: false, nameI18n: 'menu.dashboard' }],
    activeKey: '/dashboard',
    refreshKey: 0,
  };
};

const saveTabs = (state: TabsState) => {
  try {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify({
      tabs: state.tabs,
      activeKey: state.activeKey,
    }));
  } catch (e) {
    console.error('Failed to save tabs to localStorage:', e);
  }
};

const initialState: TabsState = getInitialState();

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabItem>) => {
      const exists = state.tabs.find((tab) => tab.key === action.payload.key);
      if (!exists) {
        state.tabs.push({
          ...action.payload,
          closable: action.payload.closable ?? true,
          nameI18n: action.payload.nameI18n,
        });
      } else if (action.payload.nameI18n && !exists.nameI18n) {
        // 如果已存在的标签没有 nameI18n，但新传入的有，则更新
        exists.nameI18n = action.payload.nameI18n;
        exists.label = action.payload.label;
      }
      state.activeKey = action.payload.key;
      saveTabs(state);
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      if (index > -1 && state.tabs[index].closable !== false) {
        state.tabs.splice(index, 1);
        if (state.activeKey === action.payload && state.tabs.length > 0) {
          state.activeKey = state.tabs[Math.max(0, index - 1)].key;
        }
      }
      saveTabs(state);
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
      saveTabs(state);
    },
    refreshTab: (state) => {
      state.refreshKey += 1;
    },
    removeOtherTabs: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.closable === false || tab.key === action.payload);
      state.activeKey = action.payload;
      saveTabs(state);
    },
    removeRightTabs: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      state.tabs = state.tabs.filter((tab, i) => i <= index || tab.closable === false);
      if (!state.tabs.find((tab) => tab.key === state.activeKey)) {
        state.activeKey = action.payload;
      }
      saveTabs(state);
    },
    removeLeftTabs: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      state.tabs = state.tabs.filter((tab, i) => i >= index || tab.closable === false);
      if (!state.tabs.find((tab) => tab.key === state.activeKey)) {
        state.activeKey = action.payload;
      }
      saveTabs(state);
    },
    clearTabs: (state) => {
      state.tabs = state.tabs.filter((tab) => tab.closable === false);
      if (state.tabs.length > 0) {
        state.activeKey = state.tabs[0].key;
      }
      saveTabs(state);
    },
    resetTabs: (state) => {
      state.tabs = [{ key: '/dashboard', label: '仪表盘', path: '/dashboard', closable: false, nameI18n: 'menu.dashboard' }];
      state.activeKey = '/dashboard';
      state.refreshKey = 0;
      localStorage.removeItem(TABS_STORAGE_KEY);
    },
  },
});

export const { addTab, removeTab, setActiveTab, refreshTab, removeOtherTabs, removeRightTabs, removeLeftTabs, clearTabs, resetTabs } = tabsSlice.actions;
export default tabsSlice.reducer;
