import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntdApp, Spin, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { useTranslation } from 'react-i18next';
import { store } from './store';
import { initializeSettings } from './store/slices/settingsSlice';
import { useAppSelector } from './store';
import Router from './router';
import { Language } from './types';
import { isRTL } from './i18n';

// 内部组件，用于访问Redux状态
const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, theme } = useAppSelector(state => state.settings);

  // 根据语言设置获取Antd的locale
  const getAntdLocale = (lang: Language) => {
    switch (lang) {
      case 'en-US':
        return enUS;
      case 'ar-SA':
        return arEG;
      case 'zh-CN':
      default:
        return zhCN;
    }
  };

  // 监听语言变化，更新页面标题
  useEffect(() => {
    const updateTitle = () => {
      const titleKey = 'common.appName';
      if (i18n.exists(titleKey)) {
        document.title = i18n.t(titleKey);
      } else {
        document.title = language === 'zh-CN' ? 'NovaAdmin - 通用后台管理系统' : 'NovaAdmin - Admin Dashboard';
      }
    };

    updateTitle();
    i18n.on('languageChanged', updateTitle);

    return () => {
      i18n.off('languageChanged', updateTitle);
    };
  }, [i18n, language]);

  // 应用主题到HTML根元素
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    
    // 设置CSS变量
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`);
  }, [theme]);

  return (
    <ConfigProvider
      locale={getAntdLocale(language)}
      direction={isRTL(language) ? 'rtl' : 'ltr'}
      theme={{
        token: {
          colorPrimary: theme.primaryColor,
          borderRadius: theme.borderRadius,
        },
        algorithm: theme.mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AntdApp>
        <Router />
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    // 初始化设置
    store.dispatch(initializeSettings());
    setSettingsInitialized(true);

    // 在开发环境下将store添加到window对象，便于调试和测试
    if (import.meta.env.DEV) {
      (window as any).__REDUX_STORE__ = store;
    }
  }, []);

  // 如果设置未初始化，显示加载状态
  if (!settingsInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <Spin size="large" />
        <div style={{ color: '#666', fontSize: '14px' }}>
          正在初始化应用...
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
