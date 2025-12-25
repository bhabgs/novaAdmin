/**
 * i18n 类型定义
 */

export type Language = 'zh-CN' | 'en-US' | 'ar-SA';

/**
 * i18n翻译实体
 */
export interface I18nTranslation {
  id: string;
  language: Language;
  module: string;
  key: string;
  value: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建翻译请求
 */
export interface CreateI18nTranslationDto {
  language: Language;
  module: string;
  key: string;
  value: string;
  remark?: string;
}

/**
 * 更新翻译请求
 */
export interface UpdateI18nTranslationDto {
  language?: Language;
  module?: string;
  key?: string;
  value?: string;
  remark?: string;
}

/**
 * 查询翻译参数
 */
export interface QueryI18nTranslationParams {
  page?: number;
  pageSize?: number;
  language?: Language;
  module?: string;
  keyword?: string;
}

/**
 * 翻译列表响应
 */
export interface I18nTranslationListResponse {
  list: I18nTranslation[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/**
 * 批量导入请求
 */
export interface BatchImportDto {
  language: Language;
  data: Record<string, any>;
  overwrite?: boolean;
}

/**
 * 批量导入响应
 */
export interface BatchImportResponse {
  created: number;
  updated: number;
  errors: string[];
}

/**
 * 批量删除请求
 */
export interface BatchDeleteDto {
  ids: string[];
}

/**
 * 模块名称列表响应
 */
export type ModuleListResponse = string[];
