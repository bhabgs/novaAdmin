import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { tokenUtils } from '../utils/auth';
import i18n from '../i18n';

// API 前缀配置（开发环境使用 Vite 代理）
const baseURL = '';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
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
      };
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }
    console.log(data, 'data');
    // 检查业务状态码
    if (data.code !== undefined) {
      if (data.code <= 0) {
        return data;
      } else {
        // 业务错误
        const errorMessage = data.message || i18n.t('api.requestFailed');
        toast.error(errorMessage);
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
      toast.error(i18n.t('api.networkConnectionFailed'));
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // 检查是否是登录请求 - 登录失败不应该重定向
        const requestUrl = error.config?.url || '';
        const isLoginRequest = requestUrl.includes('/auth/login');

        if (isLoginRequest) {
          // 登录请求失败，返回错误让调用方处理，不显示额外消息
          return Promise.reject(new Error(data?.message || i18n.t('api.loginFailed')));
        }

        // 其他请求的401，清除token并跳转到登录页
        tokenUtils.removeToken();
        toast.error(i18n.t('api.unauthorized'));
        // 使用 React Router 导航会更好，但这里用 href 确保状态清除
        window.location.href = '/login';
        break;
      case 403:
        toast.error(i18n.t('api.forbidden'));
        break;
      case 404:
        toast.error(i18n.t('api.notFound'));
        break;
      case 500:
        toast.error(i18n.t('api.serverError'));
        break;
      default:
        toast.error(data?.message || i18n.t('api.requestFailedWithCode', { code: status }));
    }

    return Promise.reject(error);
  },
);

// orval mutator - 用于自动生成的 API 代码
export const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.request(config);
};

// 导出请求方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.get(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.post(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.put(url, data, config);
};

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.delete(url, config);
};

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.patch(url, data, config);
};

// 文件上传
export const upload = <T = any>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
  });
};

// 文件下载
export const download = (
  url: string,
  filename?: string,
  config?: AxiosRequestConfig,
): Promise<void> => {
  return axiosInstance
    .get(url, {
      ...config,
      responseType: 'blob',
    })
    .then((response: AxiosResponse) => {
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

// @hey-api/openapi-ts 客户端配置
export const createClientConfig = <T = unknown>(config?: T): T => {
  const baseConfig = {
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    // 添加拦截器配置
    axios: axiosInstance,
  };
  return { ...baseConfig, ...(config || {}) } as T;
};
export default axiosInstance;
