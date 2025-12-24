import { ApiResponse } from '../types';
import {
  generateStatistics,
  generateUserGrowthData,
  generateOrderTrendData,
  generateRevenueChartData,
  generateCategoryDistribution,
  generateRealTimeData,
  generateRecentActivities,
  generateSystemInfo,
} from '@/data/dashboard';

// 仪表盘相关API - 使用本地假数据
export const dashboardApi = {
  // 获取统计数据
  getStatistics: (): Promise<ApiResponse<ReturnType<typeof generateStatistics>>> => {
    return Promise.resolve({
      success: true,
      data: generateStatistics(),
      message: '获取成功',
    });
  },

  // 获取用户增长数据
  getUserGrowthData: (): Promise<ApiResponse<ReturnType<typeof generateUserGrowthData>>> => {
    return Promise.resolve({
      success: true,
      data: generateUserGrowthData(),
      message: '获取成功',
    });
  },

  // 获取订单趋势数据
  getOrderTrendData: (): Promise<ApiResponse<ReturnType<typeof generateOrderTrendData>>> => {
    return Promise.resolve({
      success: true,
      data: generateOrderTrendData(),
      message: '获取成功',
    });
  },

  // 获取收入图表数据
  getRevenueChartData: (): Promise<ApiResponse<ReturnType<typeof generateRevenueChartData>>> => {
    return Promise.resolve({
      success: true,
      data: generateRevenueChartData(),
      message: '获取成功',
    });
  },

  // 获取分类分布数据
  getCategoryDistribution: (): Promise<ApiResponse<ReturnType<typeof generateCategoryDistribution>>> => {
    return Promise.resolve({
      success: true,
      data: generateCategoryDistribution(),
      message: '获取成功',
    });
  },

  // 获取实时数据
  getRealTimeData: (): Promise<ApiResponse<ReturnType<typeof generateRealTimeData>>> => {
    return Promise.resolve({
      success: true,
      data: generateRealTimeData(),
      message: '获取成功',
    });
  },

  // 获取最近活动
  getRecentActivities: (): Promise<ApiResponse<ReturnType<typeof generateRecentActivities>>> => {
    return Promise.resolve({
      success: true,
      data: generateRecentActivities(),
      message: '获取成功',
    });
  },

  // 获取系统信息
  getSystemInfo: (): Promise<ApiResponse<ReturnType<typeof generateSystemInfo>>> => {
    return Promise.resolve({
      success: true,
      data: generateSystemInfo(),
      message: '获取成功',
    });
  },

  // 刷新所有数据
  refreshAll: (): Promise<ApiResponse<null>> => {
    return Promise.resolve({
      success: true,
      data: null,
      message: '数据已刷新',
    });
  },
};
