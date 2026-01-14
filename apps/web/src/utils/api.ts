/**
 * API 响应处理工具函数
 */

import type { ApiResponse } from '@/types';

/**
 * 从 API 响应中提取数据
 * 处理两种常见的响应格式：
 * 1. { data: { data: actualData } } - 嵌套格式
 * 2. { data: actualData } - 直接格式
 *
 * @param response - API 响应对象
 * @returns 实际的数据
 */
export function extractData<T>(response: { data?: ApiResponse<T> | T }): T {
  const data = response.data;
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
}

/**
 * 从分页响应中提取列表和总数
 * @param response - API 响应对象
 * @returns 包含 list 和 total 的对象
 */
export function extractPaginatedData<T>(response: {
  data?: { data?: { list: T[]; total: number } } | { list: T[]; total: number };
}): { list: T[]; total: number } {
  const data = extractData(response);
  if (data && typeof data === 'object' && 'list' in data) {
    return data as { list: T[]; total: number };
  }
  return { list: [], total: 0 };
}

/**
 * 检查 API 响应是否成功
 * @param response - API 响应对象
 * @returns 是否成功
 */
export function isApiSuccess(response: { code?: number; data?: { code?: number } }): boolean {
  const code = response.code ?? response.data?.code ?? 0;
  return code <= 0;
}

/**
 * 获取 API 错误消息
 * @param response - API 响应对象
 * @returns 错误消息
 */
export function getApiErrorMessage(response: {
  message?: string;
  data?: { message?: string };
}): string {
  return response.message ?? response.data?.message ?? '请求失败';
}
