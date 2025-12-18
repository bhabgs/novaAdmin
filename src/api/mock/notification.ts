import { http, HttpResponse } from "msw";
import { delay, createSuccessResponse, createErrorResponse } from "./utils";
import type { Notification } from "@/types/notification";

// 生成模拟通知数据
const generateMockNotifications = (): Notification[] => {
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
    const createTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000 - (i % 5) * 10 * 60 * 1000);
    
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

let mockNotifications = generateMockNotifications();

// 计算未读数量
const getUnreadCount = (): number => {
  return mockNotifications.filter(n => n.status === 'unread').length;
};

export const notificationHandlers = [
  // 获取通知列表
  http.get("/mock-api/notifications", async ({ request }) => {
    await delay();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    // 过滤通知
    let filtered = [...mockNotifications];
    
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    
    if (status) {
      filtered = filtered.filter(n => n.status === status);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json(
      createSuccessResponse({
        list: paginated,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
        },
        unreadCount: getUnreadCount(),
      })
    );
  }),

  // 获取未读通知数量
  http.get("/mock-api/notifications/unread-count", async () => {
    await delay();

    return HttpResponse.json(
      createSuccessResponse({
        count: getUnreadCount(),
      })
    );
  }),

  // 标记通知为已读
  http.put("/mock-api/notifications/:id/read", async ({ params }) => {
    await delay();

    const { id } = params;
    const notification = mockNotifications.find((n) => n.id === id);

    if (!notification) {
      return HttpResponse.json(createErrorResponse("通知不存在", 404));
    }

    if (notification.status === 'unread') {
      notification.status = 'read';
      notification.readTime = new Date().toISOString();
    }

    return HttpResponse.json(createSuccessResponse(null, "标记成功"));
  }),

  // 批量标记为已读
  http.post("/mock-api/notifications/mark-all-read", async () => {
    await delay();

    const now = new Date().toISOString();
    mockNotifications.forEach((notification) => {
      if (notification.status === 'unread') {
        notification.status = 'read';
        notification.readTime = now;
      }
    });

    return HttpResponse.json(createSuccessResponse(null, "全部标记为已读"));
  }),

  // 删除通知
  http.delete("/mock-api/notifications/:id", async ({ params }) => {
    await delay();

    const { id } = params;
    const index = mockNotifications.findIndex((n) => n.id === id);

    if (index === -1) {
      return HttpResponse.json(createErrorResponse("通知不存在", 404));
    }

    mockNotifications.splice(index, 1);

    return HttpResponse.json(createSuccessResponse(null, "删除成功"));
  }),

  // 批量删除通知
  http.post("/mock-api/notifications/batch-delete", async ({ request }) => {
    await delay();

    const body = (await request.json()) as { ids: string[] };
    const { ids } = body;

    mockNotifications = mockNotifications.filter((n) => !ids.includes(n.id));

    return HttpResponse.json(createSuccessResponse(null, "批量删除成功"));
  }),
];

