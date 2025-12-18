import { http, HttpResponse } from 'msw';
import { delay, createSuccessResponse, createErrorResponse, createPaginatedResponse, generateUser, filterByKeyword } from './utils';

// 生成模拟用户数据
const generateMockUsers = (count: number = 50) => {
  const users = [];
  
  // 添加固定的管理员用户
  users.push({
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
  });

  // 添加普通用户
  users.push({
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
  });

  // 生成其他随机用户
  for (let i = 3; i <= count; i++) {
    users.push(generateUser(i.toString()));
  }
  
  return users;
};

let mockUsers = generateMockUsers();

export const userHandlers = [
  // 获取用户列表
  http.get('/mock-api/users', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const keyword = url.searchParams.get('keyword') || '';
    const status = url.searchParams.get('status') || '';
    const role = url.searchParams.get('role') || '';

    let filteredUsers = [...mockUsers];

    // 关键词搜索
    if (keyword) {
      filteredUsers = filterByKeyword(filteredUsers, keyword, ['username', 'name', 'email', 'phone']);
    }

    // 状态过滤
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // 角色过滤
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.roles.includes(role));
    }

    return HttpResponse.json(createPaginatedResponse(filteredUsers, page, pageSize));
  }),

  // 获取用户详情
  http.get('/mock-api/users/:id', async ({ params }) => {
    await delay();
    
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    return HttpResponse.json(createSuccessResponse(user));
  }),

  // 创建用户
  http.post('/mock-api/users', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    
    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === body.username)) {
      return HttpResponse.json(createErrorResponse('用户名已存在', 400));
    }
    
    // 检查邮箱是否已存在
    if (mockUsers.some(u => u.email === body.email)) {
      return HttpResponse.json(createErrorResponse('邮箱已存在', 400));
    }
    
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username: body.username,
      email: body.email,
      name: body.name,
      avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.username}`,
      phone: body.phone || '',
      status: body.status || 'active',
      roles: body.roles || ['user'],
      permissions: body.permissions || ['read'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    return HttpResponse.json(createSuccessResponse(newUser, '用户创建成功'));
  }),

  // 更新用户
  http.put('/mock-api/users/:id', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    // 检查用户名是否已被其他用户使用
    if (body.username && mockUsers.some(u => u.username === body.username && u.id !== id)) {
      return HttpResponse.json(createErrorResponse('用户名已存在', 400));
    }
    
    // 检查邮箱是否已被其他用户使用
    if (body.email && mockUsers.some(u => u.email === body.email && u.id !== id)) {
      return HttpResponse.json(createErrorResponse('邮箱已存在', 400));
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    
    return HttpResponse.json(createSuccessResponse(updatedUser, '用户更新成功'));
  }),

  // 删除用户
  http.delete('/mock-api/users/:id', async ({ params }) => {
    await delay();
    
    const { id } = params;
    
    if (id === '1') {
      return HttpResponse.json(createErrorResponse('不能删除管理员用户', 403));
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    mockUsers.splice(userIndex, 1);
    
    return HttpResponse.json(createSuccessResponse(null, '用户删除成功'));
  }),

  // 批量删除用户
  http.post('/mock-api/users/batch-delete', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    const { ids } = body;
    
    if (ids.includes('1')) {
      return HttpResponse.json(createErrorResponse('不能删除管理员用户', 403));
    }
    
    mockUsers = mockUsers.filter(user => !ids.includes(user.id));
    
    return HttpResponse.json(createSuccessResponse(null, '批量删除成功'));
  }),

  // 重置用户密码
  http.post('/mock-api/users/:id/reset-password', async ({ params }) => {
    await delay();
    
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    const newPassword = Math.random().toString(36).slice(-8);
    
    return HttpResponse.json(createSuccessResponse({ 
      password: newPassword 
    }, '密码重置成功'));
  }),

  // 切换用户状态
  http.put('/mock-api/users/:id/status', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    if (id === '1') {
      return HttpResponse.json(createErrorResponse('不能禁用管理员用户', 403));
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    mockUsers[userIndex].status = body.status;
    mockUsers[userIndex].updatedAt = new Date().toISOString();
    
    return HttpResponse.json(createSuccessResponse(null, '状态更新成功'));
  }),

  // 分配角色
  http.post('/mock-api/users/:id/roles', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    mockUsers[userIndex].roles = body.roleIds;
    mockUsers[userIndex].updatedAt = new Date().toISOString();
    
    return HttpResponse.json(createSuccessResponse(null, '角色分配成功'));
  }),

  // 获取用户权限
  http.get('/mock-api/users/:id/permissions', async ({ params }) => {
    await delay();
    
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return HttpResponse.json(createErrorResponse('用户不存在', 404));
    }
    
    return HttpResponse.json(createSuccessResponse(user.permissions));
  }),
];