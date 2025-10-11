import { get } from './request';
import { DashboardStats, ChartData, ApiResponse } from '../types';

// Dashboard相关API
export const dashboardApi = {
  // 获取统计数据
  getStats: (): Promise<ApiResponse<DashboardStats>> => {
    return get('/dashboard/statistics');
  },

  // 获取用户增长数据
  getUserGrowthData: (params?: {
    period?: string; // 'week' | 'month' | 'year'
  }): Promise<ApiResponse<ChartData[]>> => {
    return get('/dashboard/user-growth', { params });
  },

  // 获取订单趋势数据
  getOrderTrendData: (params?: {
    period?: string;
  }): Promise<ApiResponse<ChartData[]>> => {
    return get('/dashboard/order-trend', { params });
  },

  // 获取收入图表数据
  getRevenueChartData: (params?: {
    period?: string;
  }): Promise<ApiResponse<ChartData[]>> => {
    return get('/dashboard/revenue-chart', { params });
  },

  // 获取分类分布数据
  getCategoryDistributionData: (): Promise<ApiResponse<ChartData[]>> => {
    return get('/dashboard/category-distribution');
  },

  // 获取实时数据
  getRealTimeData: (): Promise<ApiResponse<{
    onlineUsers: number;
    todayOrders: number;
    todayRevenue: number;
    systemLoad: number;
  }>> => {
    return get('/dashboard/realtime');
  },

  // 获取最近活动
  getRecentActivities: (params?: {
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    user: string;
  }>>> => {
    return get('/dashboard/recent-activities', { params });
  },

  // 获取系统信息
  getSystemInfo: (): Promise<ApiResponse<{
    version: string;
    uptime: string;
    memory: {
      used: number;
      total: number;
    };
    cpu: {
      usage: number;
      cores: number;
    };
    disk: {
      used: number;
      total: number;
    };
  }>> => {
    return get('/dashboard/system-info');
  },
};