import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import arSA from './locales/ar-SA.json';

// RTL 语言列表
const RTL_LANGUAGES = ['ar', 'ar-SA', 'he', 'fa', 'ur'];

// 更新文档方向
export const updateDocumentDirection = (language: string) => {
  const isRTL = RTL_LANGUAGES.some((lang) => language.startsWith(lang.split('-')[0]));
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
};

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
    'ar-SA': { translation: arSA },
  },
  lng: localStorage.getItem('language') || 'zh-CN',
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
});

// 初始化时设置方向
updateDocumentDirection(i18n.language);

// 语言变化时更新方向
i18n.on('languageChanged', updateDocumentDirection);

export default i18n;
