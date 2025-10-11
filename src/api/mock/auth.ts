import { http, HttpResponse } from 'msw';
import { delay, createSuccessResponse, createErrorResponse } from './utils';

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    name: '系统管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '13800138000',
    status: 'active',
    roles: ['admin'],
    permissions: ['*'],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    name: '普通用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    phone: '13800138001',
    status: 'active',
    roles: ['user'],
    permissions: ['read'],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

// 模拟token存储
let currentToken: string | null = null;
let currentUser: any = null;

export const authHandlers = [
  // 登录
  http.post('/api/auth/login', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    const { username, password } = body;

    // 验证用户名和密码
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }

    // 简单的密码验证（实际项目中应该使用加密）
    if (password !== '123456') {
      return HttpResponse.json(createErrorResponse('密码错误', 401));
    }

    if (user.status !== 'active') {
      return HttpResponse.json(createErrorResponse('账户已被禁用', 403));
    }

    // 生成token
    const token = `mock_token_${Date.now()}_${Math.random()}`;
    const refreshToken = `mock_refresh_token_${Date.now()}_${Math.random()}`;
    
    currentToken = token;
    currentUser = user;

    return HttpResponse.json(createSuccessResponse({
      token,
      refreshToken,
      user,
      expiresIn: 7200, // 2小时
    }, '登录成功'));
  }),

  // 登出
  http.post('/api/auth/logout', async () => {
    await delay();
    
    currentToken = null;
    currentUser = null;
    
    return HttpResponse.json(createSuccessResponse(null, '登出成功'));
  }),

  // 获取用户信息
  http.get('/api/auth/userinfo', async ({ request }) => {
    await delay();
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== currentToken) {
      return HttpResponse.json(createErrorResponse('未授权', 401));
    }
    
    if (!currentUser) {
      return HttpResponse.json(createErrorResponse('用户信息不存在', 404));
    }
    
    return HttpResponse.json(createSuccessResponse(currentUser));
  }),

  // 刷新token
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay();
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== currentToken) {
      return HttpResponse.json(createErrorResponse('无效的刷新token', 401));
    }
    
    // 生成新的token
    const newToken = `mock_token_${Date.now()}_${Math.random()}`;
    const newRefreshToken = `mock_refresh_token_${Date.now()}_${Math.random()}`;
    
    currentToken = newToken;
    
    return HttpResponse.json(createSuccessResponse({
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 7200,
    }, 'Token刷新成功'));
  }),

  // 修改密码
  http.post('/api/auth/change-password', async ({ request }) => {
    await delay();
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== currentToken) {
      return HttpResponse.json(createErrorResponse('未授权', 401));
    }
    
    const body = await request.json() as any;
    const { oldPassword, newPassword, confirmPassword } = body;
    
    if (oldPassword !== '123456') {
      return HttpResponse.json(createErrorResponse('原密码错误', 400));
    }
    
    if (newPassword !== confirmPassword) {
      return HttpResponse.json(createErrorResponse('两次输入的密码不一致', 400));
    }
    
    if (newPassword.length < 6) {
      return HttpResponse.json(createErrorResponse('密码长度不能少于6位', 400));
    }
    
    return HttpResponse.json(createSuccessResponse(null, '密码修改成功'));
  }),

  // 重置密码
  http.post('/api/auth/reset-password', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    const { email } = body;
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return HttpResponse.json(createErrorResponse('邮箱不存在', 404));
    }
    
    return HttpResponse.json(createSuccessResponse(null, '重置密码邮件已发送'));
  }),

  // 验证token
  http.get('/api/auth/verify', async ({ request }) => {
    await delay();
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const valid = token === currentToken && currentToken !== null;
    
    return HttpResponse.json(createSuccessResponse({ valid }));
  }),
];