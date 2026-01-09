import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import arSA from './locales/ar-SA.json';
import { i18nControllerFindByLocale } from '@/api/services.gen';

// RTL 语言列表
const RTL_LANGUAGES = ['ar', 'ar-SA', 'he', 'fa', 'ur'];

// 更新文档方向
export const updateDocumentDirection = (language: string) => {
  const isRTL = RTL_LANGUAGES.some((lang) => language.startsWith(lang.split('-')[0]));
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
};

// 将扁平的 key-value 转换为嵌套对象
// 例如: { 'common.add': '添加' } => { common: { add: '添加' } }
const nestTranslations = (flat: Record<string, string>) => {
  const nested: any = {};
  Object.entries(flat).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  });
  return nested;
};

// 从数据库加载翻译数据
export const loadDatabaseTranslations = async (locale: string) => {
  try {
    const response = await i18nControllerFindByLocale({ path: { locale } });
    const data = response.data?.data || response.data || {};
    if (Object.keys(data).length > 0) {
      const nested = nestTranslations(data);
      // 合并到现有资源（数据库数据会覆盖静态文件）
      i18n.addResourceBundle(locale, 'translation', nested, true, true);
    }
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
  }
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
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  // 语言切换时加载该语言的数据库翻译
  loadDatabaseTranslations(lng);
});

// 应用启动时加载当前语言的数据库翻译
loadDatabaseTranslations(i18n.language);

export default i18n;
