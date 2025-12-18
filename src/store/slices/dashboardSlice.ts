import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardStats, ChartData } from '../../types';
import { dashboardApi } from '../../api/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  chartData: {
    userGrowth: ChartData[];
    orderTrend: ChartData[];
    revenueChart: ChartData[];
    categoryDistribution: ChartData[];
  };
  loading: boolean;
  error: string | null;
  refreshTime: string | null;
}

const initialState: DashboardState = {
  stats: null,
  chartData: {
    userGrowth: [],
    orderTrend: [],
    revenueChart: [],
    categoryDistribution: [],
  },
  loading: false,
  error: null,
  refreshTime: null,
};

// 获取统计数据
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取统计数据失败');
    }
  }
);

// 获取用户增长数据
export const fetchUserGrowthData = createAsyncThunk(
  'dashboard/fetchUserGrowthData',
  async (params: { period?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getUserGrowthData(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户增长数据失败');
    }
  }
);

// 获取订单趋势数据
export const fetchOrderTrendData = createAsyncThunk(
  'dashboard/fetchOrderTrendData',
  async (params: { period?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getOrderTrendData(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取订单趋势数据失败');
    }
  }
);

// 获取收入图表数据
export const fetchRevenueChartData = createAsyncThunk(
  'dashboard/fetchRevenueChartData',
  async (params: { period?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getRevenueChartData(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取收入图表数据失败');
    }
  }
);

// 获取分类分布数据
export const fetchCategoryDistributionData = createAsyncThunk(
  'dashboard/fetchCategoryDistributionData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getCategoryDistributionData();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取分类分布数据失败');
    }
  }
);

// 刷新所有数据
export const refreshDashboardData = createAsyncThunk(
  'dashboard/refreshAll',
  async (_, { dispatch }) => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats(undefined)),
        dispatch(fetchUserGrowthData({})),
        dispatch(fetchOrderTrendData({})),
        dispatch(fetchRevenueChartData({})),
        dispatch(fetchCategoryDistributionData(undefined)),
      ]);
      return new Date().toLocaleString();
    } catch (error: any) {
      throw error;
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.stats = null;
      state.chartData = {
        userGrowth: [],
        orderTrend: [],
        revenueChart: [],
        categoryDistribution: [],
      };
      state.refreshTime = null;
    },
  },
  extraReducers: (builder) => {
    // 获取统计数据
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户增长数据
    builder
      .addCase(fetchUserGrowthData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGrowthData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData.userGrowth = action.payload;
      })
      .addCase(fetchUserGrowthData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取订单趋势数据
    builder
      .addCase(fetchOrderTrendData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderTrendData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData.orderTrend = action.payload;
      })
      .addCase(fetchOrderTrendData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取收入图表数据
    builder
      .addCase(fetchRevenueChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData.revenueChart = action.payload;
      })
      .addCase(fetchRevenueChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取分类分布数据
    builder
      .addCase(fetchCategoryDistributionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryDistributionData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData.categoryDistribution = action.payload;
      })
      .addCase(fetchCategoryDistributionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 刷新所有数据
    builder
      .addCase(refreshDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshTime = action.payload;
      })
      .addCase(refreshDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;