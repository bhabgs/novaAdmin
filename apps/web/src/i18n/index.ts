import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language } from "../types";
import zhCN from "./locales/zh-CN.json";
import enUS from "./locales/en-US.json";
import arSA from "./locales/ar-SA.json";
import { get } from "../utils/request";

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = ["zh-CN", "en-US", "ar-SA"];

// RTL 语言列表
export const RTL_LANGUAGES: Language[] = ["ar-SA"];

// 默认语言
export const DEFAULT_LANGUAGE: Language = "zh-CN";

// 静态资源
const resources = {
  "zh-CN": {
    translation: zhCN,
  },
  "en-US": {
    translation: enUS,
  },
  "ar-SA": {
    translation: arSA,
  },
};

/**
 * 获取初始语言（优先从localStorage获取，然后从浏览器语言，最后使用默认语言）
 */
const getInitialLanguage = (): Language => {
  try {
    // 首先尝试从localStorage获取
    const storedLanguage = localStorage.getItem("language") as Language;
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      return storedLanguage;
    }

    // 然后尝试从设置中获取
    const storedSettings = localStorage.getItem("nova_admin_settings");
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (
        settings.language &&
        SUPPORTED_LANGUAGES.includes(settings.language)
      ) {
        return settings.language;
      }
    }

    // 最后尝试从浏览器语言获取
    const browserLanguage = navigator.language;
    if (browserLanguage.startsWith("zh")) {
      return "zh-CN";
    } else if (browserLanguage.startsWith("en")) {
      return "en-US";
    } else if (browserLanguage.startsWith("ar")) {
      return "ar-SA";
    }
  } catch (error) {
    console.error("[i18n] Failed to get initial language:", error);
  }

  return DEFAULT_LANGUAGE;
};

/**
 * 从接口加载翻译
 */
async function loadTranslationsFromAPI(): Promise<{
  'zh-CN': Record<string, string>;
  'en-US': Record<string, string>;
  'ar-SA': Record<string, string>;
} | null> {
  try {
    const response = await get<{
      success: boolean;
      data: {
        'zh-CN': Record<string, string>;
        'en-US': Record<string, string>;
        'ar-SA': Record<string, string>;
      };
    }>('/nova-admin-api/i18n/translations/all');
    
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('[i18n] Failed to load translations from API:', error);
    return null;
  }
}

/**
 * 初始化i18n（异步，需要在App中调用）
 * 优先从接口加载翻译，失败则使用本地翻译作为降级方案
 */
export async function initializeI18n(): Promise<void> {
  // 先使用本地资源初始化，确保应用可以正常启动
  await i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: process.env.NODE_ENV === "development",
  });

  // 尝试从接口加载翻译
  const apiTranslations = await loadTranslationsFromAPI();
  if (apiTranslations) {
    console.log('[i18n] Loaded translations from API');
    // 将接口返回的翻译添加到 i18n
    for (const language of SUPPORTED_LANGUAGES) {
      const translations = apiTranslations[language as keyof typeof apiTranslations];
      if (translations) {
        i18n.addResourceBundle(
          language,
          'translation',
          translations,
          true, // 合并
          true  // 覆盖
        );
      }
    }
  } else {
    console.log('[i18n] Using local translations as fallback');
  }
}

/**
 * 刷新翻译（优先从接口重新加载，失败则使用本地资源）
 */
export async function refreshTranslations(): Promise<void> {
  console.log("[i18n] Refreshing translations...");
  
  // 优先从接口加载翻译
  const apiTranslations = await loadTranslationsFromAPI();
  if (apiTranslations) {
    console.log("[i18n] Refreshed translations from API");
    for (const language of SUPPORTED_LANGUAGES) {
      const translations = apiTranslations[language as keyof typeof apiTranslations];
      if (translations) {
        i18n.addResourceBundle(
          language,
          'translation',
          translations,
          true, // 合并
          true  // 覆盖
        );
      }
    }
  } else {
    // 降级方案：重新加载本地静态资源
    console.log("[i18n] Refreshed translations from local resources");
    for (const language of SUPPORTED_LANGUAGES) {
      const resource = resources[language as keyof typeof resources];
      if (resource) {
        i18n.addResourceBundle(
          language,
          "translation",
          resource.translation,
          true,
          true,
        );
      }
    }
  }
  console.log("[i18n] Translations refreshed successfully");
}

// 监听语言变化，同步到localStorage
i18n.on("languageChanged", (lng: Language) => {
  if (SUPPORTED_LANGUAGES.includes(lng)) {
    localStorage.setItem("language", lng);

    // 更新HTML lang属性
    document.documentElement.lang = lng;

    // 更新 HTML dir 属性以支持 RTL
    document.documentElement.dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";

    // 更新页面标题的语言
    const titleKey = "common.appName";
    if (i18n.exists(titleKey)) {
      document.title = i18n.t(titleKey);
    }
  }
});

// 导出语言切换函数
export const changeLanguage = async (language: Language): Promise<void> => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    console.warn(`Unsupported language: ${language}`);
    return;
  }

  await i18n.changeLanguage(language);
};

// 获取当前语言
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language;
};

// 检查是否支持某种语言
export const isLanguageSupported = (language: string): language is Language => {
  return SUPPORTED_LANGUAGES.includes(language as Language);
};

// 检查语言是否为 RTL
export const isRTL = (language?: Language): boolean => {
  const lang = language || getCurrentLanguage();
  return RTL_LANGUAGES.includes(lang);
};

export default i18n;
