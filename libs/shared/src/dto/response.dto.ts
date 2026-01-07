/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
}

