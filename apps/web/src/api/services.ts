import request from '@/utils/request';

// Auth API
export const authApi = {
  login: (data: { username: string; password: string }) =>
    request.post<{ accessToken: string; user: any }>('/api/auth/auth/login', data),
};

// Users API
export const usersApi = {
  findAll: (params?: any) =>
    request.get<{ list: any[]; total: number }>('/api/rbac/users', { params }),
  create: (data: any) => request.post('/api/rbac/users', data),
  findOne: (id: string) => request.get(`/api/rbac/users/${id}`),
  update: (id: string, data: any) => request.put(`/api/rbac/users/${id}`, data),
  remove: (id: string) => request.delete(`/api/rbac/users/${id}`),
  batchRemove: (ids: string[]) => request.delete('/api/rbac/users/batch', { data: { ids } }),
};

// Roles API
export const rolesApi = {
  findAll: (params?: any) =>
    request.get<{ list: any[]; total: number }>('/api/rbac/roles', { params }),
  create: (data: any) => request.post('/api/rbac/roles', data),
  findOne: (id: string) => request.get(`/api/rbac/roles/${id}`),
  update: (id: string, data: any) => request.put(`/api/rbac/roles/${id}`, data),
  remove: (id: string) => request.delete(`/api/rbac/roles/${id}`),
  batchRemove: (ids: string[]) => request.delete('/api/rbac/roles/batch', { data: { ids } }),
};

// Departments API
export const departmentsApi = {
  findAll: () => request.get<any[]>('/api/rbac/departments'),
  create: (data: any) => request.post('/api/rbac/departments', data),
  findOne: (id: string) => request.get(`/api/rbac/departments/${id}`),
  update: (id: string, data: any) => request.put(`/api/rbac/departments/${id}`, data),
  remove: (id: string) => request.delete(`/api/rbac/departments/${id}`),
};

// Menus API
export const menusApi = {
  findAll: () => request.get<any[]>('/api/rbac/menus'),
  create: (data: any) => request.post('/api/rbac/menus', data),
  findOne: (id: string) => request.get(`/api/rbac/menus/${id}`),
  update: (id: string, data: any) => request.put(`/api/rbac/menus/${id}`, data),
  remove: (id: string) => request.delete(`/api/rbac/menus/${id}`),
};

// Configs API
export const configsApi = {
  findAll: () => request.get<any[]>('/api/system/configs'),
  set: (data: any) => request.post('/api/system/configs', data),
  findByKey: (key: string) => request.get(`/api/system/configs/${key}`),
  remove: (key: string) => request.delete(`/api/system/configs/${key}`),
};

// I18n API
export const i18nApi = {
  findAll: (params?: { locale?: string }) =>
    request.get<any[]>('/api/system/i18n', { params }),
  set: (data: any) => request.post('/api/system/i18n', data),
  findByLocale: (locale: string) => request.get(`/api/system/i18n/locale/${locale}`),
  batchSet: (data: any) => request.post('/api/system/i18n/batch', data),
  remove: (id: string) => request.delete(`/api/system/i18n/${id}`),
};

// Logs API
export const logsApi = {
  findAll: (params?: any) => request.get<any[]>('/api/system/logs', { params }),
  create: (data: any) => request.post('/api/system/logs', data),
  clear: () => request.delete('/api/system/logs/clear'),
};
