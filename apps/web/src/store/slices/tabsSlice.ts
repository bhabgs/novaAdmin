import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
  key: string;
  label: string;
  path: string;
  closable?: boolean;
}

interface TabsState {
  tabs: TabItem[];
  activeKey: string;
  refreshKey: number;
}

const initialState: TabsState = {
  tabs: [{ key: '/dashboard', label: '仪表盘', path: '/dashboard', closable: false }],
  activeKey: '/dashboard',
  refreshKey: 0,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabItem>) => {
      const exists = state.tabs.find((tab) => tab.key === action.payload.key);
      if (!exists) {
        state.tabs.push({ ...action.payload, closable: action.payload.closable ?? true });
      }
      state.activeKey = action.payload.key;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      if (index > -1 && state.tabs[index].closable !== false) {
        state.tabs.splice(index, 1);
        if (state.activeKey === action.payload && state.tabs.length > 0) {
          state.activeKey = state.tabs[Math.max(0, index - 1)].key;
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
    },
    refreshTab: (state) => {
      state.refreshKey += 1;
    },
    removeOtherTabs: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.closable === false || tab.key === action.payload);
      state.activeKey = action.payload;
    },
    removeRightTabs: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      state.tabs = state.tabs.filter((tab, i) => i <= index || tab.closable === false);
      if (!state.tabs.find((tab) => tab.key === state.activeKey)) {
        state.activeKey = action.payload;
      }
    },
    removeLeftTabs: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex((tab) => tab.key === action.payload);
      state.tabs = state.tabs.filter((tab, i) => i >= index || tab.closable === false);
      if (!state.tabs.find((tab) => tab.key === state.activeKey)) {
        state.activeKey = action.payload;
      }
    },
    clearTabs: (state) => {
      state.tabs = state.tabs.filter((tab) => tab.closable === false);
      if (state.tabs.length > 0) {
        state.activeKey = state.tabs[0].key;
      }
    },
  },
});

export const { addTab, removeTab, setActiveTab, refreshTab, removeOtherTabs, removeRightTabs, removeLeftTabs, clearTabs } = tabsSlice.actions;
export default tabsSlice.reducer;
