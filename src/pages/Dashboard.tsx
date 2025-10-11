import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Button } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchDashboardStats,
  fetchUserGrowthData,
  fetchOrderTrendData,
  refreshDashboardData,
} from '../store/slices/dashboardSlice';
import PageContainer from '../components/PageContainer';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    stats,
    chartData,
    loading,
  } = useAppSelector(state => state.dashboard);

  useEffect(() => {
    // 加载所有数据
    dispatch(fetchDashboardStats());
    dispatch(fetchUserGrowthData({ period: '30d' }));
    dispatch(fetchOrderTrendData({ period: '12m' }));
  }, [dispatch]);

  // 刷新所有数据
  const handleRefresh = () => {
    dispatch(refreshDashboardData());
  };

  // 统计卡片数据
  const statisticCards = [
    {
      title: t('dashboard.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: <UserOutlined className="text-blue-500" />,
      color: 'bg-blue-50',
      growth: stats?.userGrowthRate || 0,
      prefix: '',
      suffix: '',
    },
    {
      title: t('dashboard.totalOrders'),
      value: stats?.totalOrders || 0,
      icon: <ShoppingCartOutlined className="text-green-500" />,
      color: 'bg-green-50',
      growth: stats?.orderGrowthRate || 0,
      prefix: '',
      suffix: '',
    },
    {
      title: t('dashboard.totalRevenue'),
      value: stats?.totalRevenue || 0,
      icon: <DollarOutlined className="text-orange-500" />,
      color: 'bg-orange-50',
      growth: stats?.revenueGrowthRate || 0,
      prefix: '¥',
      suffix: '',
    },
    {
      title: t('dashboard.totalProducts'),
      value: stats?.totalProducts || 0,
      icon: <AppstoreOutlined className="text-purple-500" />,
      color: 'bg-purple-50',
      growth: stats?.productGrowthRate || 0,
      prefix: '',
      suffix: '',
    },
  ];



  // 用户增长趋势数据（简化显示）
  const recentGrowth = chartData.userGrowth?.slice(-7) || [];
  const totalNewUsers = recentGrowth.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <PageContainer ghost>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {t('dashboard.refreshData')}
          </Button>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]}>
          {statisticCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                    <Statistic
                      value={card.value}
                      prefix={card.prefix}
                      suffix={card.suffix}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <div className="flex items-center mt-2">
                      {card.growth >= 0 ? (
                        <ArrowUpOutlined className="text-green-500 text-xs" />
                      ) : (
                        <ArrowDownOutlined className="text-red-500 text-xs" />
                      )}
                      <span
                        className={`text-xs ml-1 ${
                          card.growth >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(card.growth).toFixed(1)}%
                      </span>
                      <span className="text-gray-400 text-xs ml-1">{t('dashboard.comparedToLastMonth')}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 图表和数据 */}
        <Row gutter={[16, 16]}>
          {/* 用户增长趋势 */}
          <Col xs={24} lg={12}>
            <Card
              title={t('dashboard.userGrowthTrend')}
              extra={<span className="text-sm text-gray-500">{t('dashboard.last7Days')}</span>}
              className="h-80"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('dashboard.newUsers')}</span>
                  <span className="text-2xl font-bold text-blue-500">
                    {totalNewUsers}
                  </span>
                </div>

                {/* 简化的趋势显示 */}
                <div className="space-y-2">
                  {recentGrowth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          percent={(item.value / Math.max(...recentGrowth.map(d => d.value))) * 100}
                          showInfo={false}
                          size="small"
                          className="w-20"
                        />
                        <span className="text-sm font-medium w-8 text-right">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>

          {/* 订单统计 */}
          <Col xs={24} lg={12}>
            <Card
              title={t('dashboard.orderStatistics')}
              extra={<span className="text-sm text-gray-500">{t('dashboard.last12Months')}</span>}
              className="h-80"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {chartData.orderTrend?.reduce((sum, item) => sum + item.value, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-500">{t('dashboard.totalOrdersLabel')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      ¥{(chartData.orderTrend?.reduce((sum, item) => sum + item.value * 100, 0) || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{t('dashboard.totalRevenueLabel')}</div>
                  </div>
                </div>

                {/* 月度趋势 */}
                <div className="space-y-2">
                  {chartData.orderTrend?.slice(-6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">
                          {item.value} {t('dashboard.orders')}
                        </span>
                        <span className="text-sm font-medium">
                          ¥{(item.value * 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 最近活动 */}
        <Card
          title={t('dashboard.recentActivities')}
          extra={
            <Button type="link" disabled>
              {t('dashboard.viewMore')}
            </Button>
          }
        >
          <div className="text-center py-8 text-gray-500">
            <p>{t('dashboard.recentActivityUnderDevelopment')}</p>
            <p className="text-sm mt-2">{t('dashboard.recentActivityComingSoon')}</p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;