// 多语言模块类型
export interface I18nModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 多语言类型
export interface I18n {
  id: string;
  moduleId: string;
  module?: I18nModule;
  key: string;
  zhCn: string;
  enUs: string;
  arSa: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 多语言模块表单数据
export interface I18nModuleFormData {
  code: string;
  name: string;
  description?: string;
  remark?: string;
}

// 多语言表单数据
export interface I18nFormData {
  moduleId: string;
  key: string;
  zhCn: string;
  enUs: string;
  arSa: string;
  remark?: string;
}

