// 本地仪表盘假数据

// 生成统计数据
export const generateStatistics = () => ({
  totalUsers: 1234,
  totalOrders: 5678,
  totalRevenue: 123456.78,
  totalProducts: 890,
  userGrowthRate: 12.5,
  orderGrowthRate: 8.3,
  revenueGrowthRate: 15.2,
  productGrowthRate: 5.7,
});

// 生成用户增长数据
export const generateUserGrowthData = () => {
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
export const generateOrderTrendData = () => {
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
export const generateRevenueChartData = () => {
  const categories = ['产品销售', '服务费用', '广告收入', '其他收入'];

  return categories.map((category) => ({
    category,
    value: Math.floor(Math.random() * 50000) + 10000,
    percentage: Math.floor(Math.random() * 40) + 10,
  }));
};

// 生成分类分布数据
export const generateCategoryDistribution = () => {
  const categories = ['电子产品', '服装配饰', '家居用品', '图书音像', '运动户外', '美妆护肤'];

  return categories.map((name) => ({
    name,
    value: Math.floor(Math.random() * 1000) + 100,
    percentage: Math.floor(Math.random() * 25) + 5,
  }));
};

// 生成实时数据
export const generateRealTimeData = () => ({
  onlineUsers: Math.floor(Math.random() * 500) + 100,
  todayOrders: Math.floor(Math.random() * 100) + 20,
  todayRevenue: Math.floor(Math.random() * 10000) + 5000,
  conversionRate: (Math.random() * 10 + 5).toFixed(2),
});

// 生成最近活动
export const generateRecentActivities = () => {
  const activities = [];
  const actions = ['创建', '更新', '删除', '审核通过', '审核拒绝'];
  const types = ['用户', '订单', '产品', '角色', '菜单'];

  for (let i = 0; i < 10; i++) {
    activities.push({
      id: i.toString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      type: types[Math.floor(Math.random() * types.length)],
      description: `${types[Math.floor(Math.random() * types.length)]} ${actions[Math.floor(Math.random() * actions.length)]}操作`,
      user: `用户${Math.floor(Math.random() * 100)}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return activities;
};

// 生成系统信息
export const generateSystemInfo = () => ({
  database: {
    status: 'online',
    size: '2.5GB',
    usage: '65%',
  },
  cache: {
    status: 'online',
    size: '512MB',
    usage: '40%',
  },
  storage: {
    status: 'online',
    size: '100GB',
    usage: '55%',
  },
  cpu: '45%',
  memory: '62%',
  uptime: '12d 5h 32m',
});
