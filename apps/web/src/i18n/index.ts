import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language, ApiResponse } from "../types";
import { i18nControllerGetAllTranslations } from "../api";
import zhCN from "./locales/zh-CN.json";
import enUS from "./locales/en-US.json";
import arSA from "./locales/ar-SA.json";

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = ["zh-CN", "en-US", "ar-SA"];

// RTL 语言列表
export const RTL_LANGUAGES: Language[] = ["ar-SA"];

// 默认语言
export const DEFAULT_LANGUAGE: Language = "zh-CN";

// 缓存键
const CACHE_KEY = "nova_i18n_translations";
const CACHE_TIME_KEY = `${CACHE_KEY}_time`;
const VERSION_KEY = "nova_i18n_version";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

// 降级用的静态资源
const fallbackResources = {
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
 * 从API加载翻译数据
 */
async function loadTranslationsFromAPI(): Promise<
  Record<Language, Record<string, unknown>> | null
> {
  try {
    // 检查localStorage缓存
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < CACHE_DURATION) {
        console.log("[i18n] Using cached translations from localStorage");
        return JSON.parse(cachedData);
      }
    }

    // 从API加载
    console.log("[i18n] Loading translations from API...");
    try {
      const response = (await i18nControllerGetAllTranslations()) as unknown as ApiResponse<
        Record<Language, Record<string, unknown>>
      >;

      // 检查API响应格式
      if (response.success && response.data && typeof response.data === "object") {
        // 缓存到localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(response.data));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

        if (
          response.data &&
          typeof response.data === "object" &&
          "version" in response.data
        ) {
          localStorage.setItem(
            VERSION_KEY,
            String((response.data as { version?: string }).version || ""),
          );
        }

        console.log("[i18n] Translations loaded from API successfully");
        return response.data;
      }

      console.warn("[i18n] API response format invalid, using fallback");
      return null;
    } catch (error: unknown) {
      // API调用失败（可能是未授权或其他错误），使用降级方案
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[i18n] Failed to load from API: ${errorMessage}, using fallback`,
      );
      return null;
    }
  } catch (error) {
    console.error("[i18n] Error loading from API:", error);
    return null;
  }
}

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
 * 初始化i18n（异步，需要在App中调用）
 */
export async function initializeI18n(): Promise<void> {
  const apiTranslations = await loadTranslationsFromAPI();

  // 构建资源对象（API优先，失败则使用静态JSON）
  const resources: any = {};

  if (apiTranslations) {
    // 使用API返回的数据
    for (const language of SUPPORTED_LANGUAGES) {
      resources[language] = {
        translation: apiTranslations[language] || fallbackResources[language]?.translation || {},
      };
    }
  } else {
    // 使用静态JSON
    Object.assign(resources, fallbackResources);
  }

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
}

/**
 * 刷新翻译（当管理员更新翻译后调用）
 */
export async function refreshTranslations(): Promise<void> {
  console.log("[i18n] Refreshing translations...");

  // 清除缓存
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);

  // 重新加载
  const apiTranslations = await loadTranslationsFromAPI();

  if (apiTranslations) {
    // 更新所有语言的资源
    for (const language of SUPPORTED_LANGUAGES) {
      i18n.addResourceBundle(
        language,
        "translation",
        apiTranslations[language] || {},
        true,
        true,
      );
    }
    console.log("[i18n] Translations refreshed successfully");
  } else {
    console.warn("[i18n] Failed to refresh translations");
  }
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
