import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { tokenUtils } from '../utils/auth';
import i18n from '../i18n';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加token到请求头
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }

    // 检查业务状态码
    if (data.code !== undefined) {
      if (data.code === 200 || data.success) {
        return data;
      } else {
        // 业务错误
        const errorMessage = data.message || i18n.t('api.requestFailed');
        message.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    }

    // 直接返回数据
    return data;
  },
  (error) => {
    console.error('Response error:', error);

    // 网络错误
    if (!error.response) {
      message.error(i18n.t('api.networkConnectionFailed'));
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // 未授权，清除token并跳转到登录页
        tokenUtils.removeToken();
        message.error(i18n.t('api.unauthorized'));
        window.location.href = '/auth/login';
        break;
      case 403:
        message.error(i18n.t('api.forbidden'));
        break;
      case 404:
        message.error(i18n.t('api.notFound'));
        break;
      case 500:
        message.error(i18n.t('api.serverError'));
        break;
      default:
        message.error(data?.message || i18n.t('api.requestFailedWithCode', { code: status }));
    }

    return Promise.reject(error);
  }
);

// 导出请求方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.get(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.post(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.put(url, data, config);
};

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.delete(url, config);
};

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.patch(url, data, config);
};

// 文件上传
export const upload = <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> => {
  return request.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
  });
};

// 文件下载
export const download = (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
  return request.get(url, {
    ...config,
    responseType: 'blob',
  }).then((response: AxiosResponse) => {
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

export default request;