import { http, HttpResponse } from 'msw';
import { delay, createSuccessResponse, generateChartData } from './utils';

// 生成统计数据
const generateStatistics = () => {
  return {
    totalUsers: 1234,
    totalOrders: 5678,
    totalRevenue: 123456.78,
    totalProducts: 890,
    userGrowthRate: 12.5,
    orderGrowthRate: 8.3,
    revenueGrowthRate: 15.2,
    productGrowthRate: 5.7,
  };
};

// 生成用户增长数据
const generateUserGrowthData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      name: `${date.getMonth() + 1}-${date.getDate().toString().padStart(2, '0')}`,
      value: Math.floor(Math.random() * 30) + 10,
    });
  }
  
  return data;
};

// 生成订单趋势数据
const generateOrderTrendData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    data.push({
      name: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
      value: Math.floor(Math.random() * 500) + 200,
    });
  }
  
  return data;
};

// 生成收入图表数据
const generateRevenueChartData = () => {
  const categories = ['产品销售', '服务费用', '广告收入', '其他收入'];
  
  return categories.map(category => ({
    category,
    value: Math.floor(Math.random() * 50000) + 10000,
    percentage: Math.floor(Math.random() * 40) + 10,
  }));
};

// 生成分类分布数据
const generateCategoryDistribution = () => {
  const categories = ['电子产品', '服装配饰', '家居用品', '图书音像', '运动户外', '美妆护肤'];
  
  return categories.map(name => ({
    name,
    value: Math.floor(Math.random() * 1000) + 100,
    percentage: Math.floor(Math.random() * 25) + 5,
  }));
};

// 生成实时数据
const generateRealTimeData = () => {
  return {
    onlineUsers: Math.floor(Math.random() * 500) + 100,
    todayOrders: Math.floor(Math.random() * 100) + 20,
    todayRevenue: Math.floor(Math.random() * 10000) + 2000,
    systemLoad: Math.floor(Math.random() * 50) + 20,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    cpuUsage: Math.floor(Math.random() * 60) + 20,
  };
};

// 生成最近活动数据
const generateRecentActivities = () => {
  const activities = [
    { type: 'user_register', description: '新用户注册' },
    { type: 'order_created', description: '新订单创建' },
    { type: 'payment_completed', description: '支付完成' },
    { type: 'product_updated', description: '产品更新' },
    { type: 'user_login', description: '用户登录' },
    { type: 'system_backup', description: '系统备份' },
  ];
  
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const time = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    
    data.push({
      id: i + 1,
      type: activity.type,
      description: activity.description,
      user: `用户${Math.floor(Math.random() * 1000) + 1}`,
      time: time.toISOString(),
    });
  }
  
  return data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

// 生成系统信息
const generateSystemInfo = () => {
  return {
    version: '1.0.0',
    environment: 'production',
    uptime: Math.floor(Math.random() * 30) + 1, // 天数
    lastBackup: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    database: {
      status: 'healthy',
      connections: Math.floor(Math.random() * 50) + 10,
      size: `${Math.floor(Math.random() * 500) + 100}MB`,
    },
    cache: {
      status: 'healthy',
      hitRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      memory: `${Math.floor(Math.random() * 200) + 50}MB`,
    },
    storage: {
      total: '1TB',
      used: `${Math.floor(Math.random() * 500) + 200}GB`,
      available: `${Math.floor(Math.random() * 300) + 200}GB`,
    },
  };
};

export const dashboardHandlers = [
  // 获取统计数据
  http.get('/mock-api/dashboard/statistics', async () => {
    await delay();
    
    const statistics = generateStatistics();
    return HttpResponse.json(createSuccessResponse(statistics));
  }),

  // 获取用户增长数据
  http.get('/mock-api/dashboard/user-growth', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const data = generateUserGrowthData();
    const filteredData = data.slice(-days);
    
    return HttpResponse.json(createSuccessResponse(filteredData));
  }),

  // 获取订单趋势数据
  http.get('/mock-api/dashboard/order-trend', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '12');
    
    const data = generateOrderTrendData();
    const filteredData = data.slice(-months);
    
    return HttpResponse.json(createSuccessResponse(filteredData));
  }),

  // 获取收入图表数据
  http.get('/mock-api/dashboard/revenue-chart', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'category';
    
    let data;
    if (type === 'category') {
      data = generateRevenueChartData();
    } else {
      // 可以根据不同类型生成不同的数据
      data = generateChartData(10);
    }
    
    return HttpResponse.json(createSuccessResponse(data));
  }),

  // 获取分类分布数据
  http.get('/mock-api/dashboard/category-distribution', async () => {
    await delay();
    
    const data = generateCategoryDistribution();
    return HttpResponse.json(createSuccessResponse(data));
  }),

  // 获取实时数据
  http.get('/mock-api/dashboard/realtime', async () => {
    await delay(500); // 实时数据延迟较短
    
    const data = generateRealTimeData();
    return HttpResponse.json(createSuccessResponse(data));
  }),

  // 获取最近活动
  http.get('/mock-api/dashboard/recent-activities', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const data = generateRecentActivities();
    const filteredData = data.slice(0, limit);
    
    return HttpResponse.json(createSuccessResponse(filteredData));
  }),

  // 获取系统信息
  http.get('/mock-api/dashboard/system-info', async () => {
    await delay();
    
    const data = generateSystemInfo();
    return HttpResponse.json(createSuccessResponse(data));
  }),

  // 刷新所有数据
  http.post('/mock-api/dashboard/refresh', async () => {
    await delay();
    
    const data = {
      statistics: generateStatistics(),
      userGrowth: generateUserGrowthData(),
      orderTrend: generateOrderTrendData(),
      revenueChart: generateRevenueChartData(),
      categoryDistribution: generateCategoryDistribution(),
      realtime: generateRealTimeData(),
      recentActivities: generateRecentActivities(),
      systemInfo: generateSystemInfo(),
    };
    
    return HttpResponse.json(createSuccessResponse(data, '数据刷新成功'));
  }),

  // 导出数据
  http.get('/mock-api/dashboard/export', async ({ request }) => {
    await delay(2000); // 导出需要更长时间
    
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'excel';
    
    // 模拟文件下载
    const fileName = `dashboard_data_${new Date().toISOString().split('T')[0]}.${type}`;
    
    return HttpResponse.json(createSuccessResponse({
      fileName,
      downloadUrl: `/api/files/download/${fileName}`,
      size: '2.5MB',
    }, '数据导出成功'));
  }),
];