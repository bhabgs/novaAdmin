import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
  key: string;
  title: string; // 默认标题（备用）
  i18nKey?: string; // 国际化 key
  path: string;
  closable?: boolean;
  isIframe?: boolean; // 是否为 iframe
  iframeUrl?: string; // iframe URL
}

interface TabsState {
  activeKey: string;
  items: TabItem[];
}

// 从 localStorage 加载标签页状态
const loadTabsFromStorage = (): TabsState => {
  try {
    const savedTabs = localStorage.getItem('nova_tabs');
    if (savedTabs) {
      const parsed = JSON.parse(savedTabs);
      // 确保至少有 dashboard 标签
      if (parsed.items && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load tabs from localStorage:', error);
  }

  // 返回默认状态
  return {
    activeKey: '/dashboard',
    items: [
      {
        key: '/dashboard',
        title: 'Dashboard',
        i18nKey: 'menu.dashboard',
        path: '/dashboard',
        closable: false,
      },
    ],
  };
};

const initialState: TabsState = loadTabsFromStorage();

// 保存标签页状态到 localStorage
const saveTabsToStorage = (state: TabsState) => {
  try {
    localStorage.setItem('nova_tabs', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save tabs to localStorage:', error);
  }
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    // 添加标签页
    addTab: (state, action: PayloadAction<TabItem>) => {
      const existingTab = state.items.find(item => item.key === action.payload.key);
      if (!existingTab) {
        state.items.push({
          ...action.payload,
          closable: action.payload.closable !== false,
        });
      }
      state.activeKey = action.payload.key;
      saveTabsToStorage(state);
    },

    // 移除标签页
    removeTab: (state, action: PayloadAction<string>) => {
      const targetKey = action.payload;
      const targetIndex = state.items.findIndex(item => item.key === targetKey);

      if (targetIndex === -1) return;

      // 不能关闭首页
      if (!state.items[targetIndex].closable) return;

      // 如果关闭的是当前激活的标签页，需要切换到其他标签页
      if (state.activeKey === targetKey) {
        const newActiveIndex = targetIndex === 0 ? 0 : targetIndex - 1;
        state.activeKey = state.items[newActiveIndex].key;
      }

      state.items = state.items.filter(item => item.key !== targetKey);
      saveTabsToStorage(state);
    },

    // 切换标签页
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
      saveTabsToStorage(state);
    },

    // 关闭其他标签页
    closeOtherTabs: (state, action: PayloadAction<string>) => {
      const targetKey = action.payload;
      state.items = state.items.filter(item => item.key === targetKey || !item.closable);
      state.activeKey = targetKey;
      saveTabsToStorage(state);
    },

    // 关闭所有标签页（保留不可关闭的）
    closeAllTabs: (state) => {
      state.items = state.items.filter(item => !item.closable);
      state.activeKey = state.items[0]?.key || '/dashboard';
      saveTabsToStorage(state);
    },

    // 关闭右侧标签页
    closeRightTabs: (state, action: PayloadAction<string>) => {
      const targetKey = action.payload;
      const targetIndex = state.items.findIndex(item => item.key === targetKey);
      if (targetIndex === -1) return;

      state.items = state.items.filter((item, index) =>
        index <= targetIndex || !item.closable
      );

      // 如果当前激活的标签页被关闭了，切换到目标标签页
      if (!state.items.find(item => item.key === state.activeKey)) {
        state.activeKey = targetKey;
      }
      saveTabsToStorage(state);
    },

    // 更新标签页标题
    updateTabTitle: (state, action: PayloadAction<{ key: string; title: string; i18nKey?: string }>) => {
      const tab = state.items.find(item => item.key === action.payload.key);
      if (tab) {
        tab.title = action.payload.title;
        if (action.payload.i18nKey) {
          tab.i18nKey = action.payload.i18nKey;
        }
        saveTabsToStorage(state);
      }
    },
  },
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  closeOtherTabs,
  closeAllTabs,
  closeRightTabs,
  updateTabTitle,
} = tabsSlice.actions;

export default tabsSlice.reducer;
