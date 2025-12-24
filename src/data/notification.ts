// 本地通知假数据
import type { Notification } from '@/types/notification';

// 生成模拟通知数据
export const generateMockNotifications = (): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];

  // 生成不同类型的通知
  const types: Array<{ type: Notification['type']; title: string; content: string }> = [
    {
      type: 'system',
      title: '系统维护通知',
      content: '系统将于今晚 22:00-24:00 进行维护升级，期间可能无法访问，请提前做好准备。',
    },
    {
      type: 'success',
      title: '订单处理成功',
      content: '您的订单 #12345 已成功处理，预计 3-5 个工作日内送达。',
    },
    {
      type: 'warning',
      title: '账户安全提醒',
      content: '检测到您的账户在异地登录，如非本人操作，请立即修改密码。',
    },
    {
      type: 'info',
      title: '新功能上线',
      content: '通知中心功能已上线，您可以在这里查看所有系统通知和消息。',
    },
    {
      type: 'error',
      title: '支付失败',
      content: '您的支付请求失败，请检查支付方式或联系客服。',
    },
  ];

  // 生成 30 条通知
  for (let i = 0; i < 30; i++) {
    const typeIndex = i % types.length;
    const typeData = types[typeIndex];
    const hoursAgo = Math.floor(i / 5);
    const createTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000 - ((i % 5) * 10 * 60 * 1000));

    notifications.push({
      id: `notification-${i + 1}`,
      title: typeData.title + (i > types.length - 1 ? ` #${Math.floor(i / types.length) + 1}` : ''),
      content: typeData.content,
      type: typeData.type,
      status: i < 10 ? 'unread' : 'read',
      createTime: createTime.toISOString(),
      readTime: i < 10 ? undefined : new Date(createTime.getTime() + 5 * 60 * 1000).toISOString(),
      link: i % 3 === 0 ? `/notifications/${i + 1}` : undefined,
      sender: i % 4 === 0 ? '系统管理员' : undefined,
    });
  }

  return notifications.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
};

export const mockNotifications = generateMockNotifications();

// 计算未读数量
export const getUnreadCount = (): number => {
  return mockNotifications.filter((n) => n.status === 'unread').length;
};
