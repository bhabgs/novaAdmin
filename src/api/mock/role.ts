import { http, HttpResponse } from 'msw';
import { delay, createSuccessResponse, createErrorResponse, createPaginatedResponse, generateRole, filterByKeyword } from './utils';

// 生成模拟角色数据
const generateMockRoles = () => {
  return [
    {
      id: '1',
      name: '超级管理员',
      code: 'admin',
      description: '系统超级管理员，拥有所有权限',
      permissions: ['*'],
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: '普通用户',
      code: 'user',
      description: '普通用户，只有基本的查看权限',
      permissions: ['read'],
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: '编辑者',
      code: 'editor',
      description: '编辑者，可以编辑内容',
      permissions: ['read', 'write'],
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: '审核员',
      code: 'reviewer',
      description: '审核员，可以审核内容',
      permissions: ['read', 'review'],
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
  ];
};

// 生成模拟权限数据
const generateMockPermissions = () => {
  return [
    {
      id: '1',
      name: '查看权限',
      code: 'read',
      description: '可以查看内容',
      module: 'common',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: '编辑权限',
      code: 'write',
      description: '可以编辑内容',
      module: 'common',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      name: '删除权限',
      code: 'delete',
      description: '可以删除内容',
      module: 'common',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      name: '审核权限',
      code: 'review',
      description: '可以审核内容',
      module: 'content',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '5',
      name: '用户管理',
      code: 'user:manage',
      description: '可以管理用户',
      module: 'user',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '6',
      name: '角色管理',
      code: 'role:manage',
      description: '可以管理角色',
      module: 'role',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '7',
      name: '菜单管理',
      code: 'menu:manage',
      description: '可以管理菜单',
      module: 'menu',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '8',
      name: '系统设置',
      code: 'system:setting',
      description: '可以修改系统设置',
      module: 'system',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
  ];
};

let mockRoles = generateMockRoles();
const mockPermissions = generateMockPermissions();

export const roleHandlers = [
  // 获取角色列表
  http.get('/api/roles', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const keyword = url.searchParams.get('keyword') || '';

    let filteredRoles = [...mockRoles];

    // 关键词搜索
    if (keyword) {
      filteredRoles = filterByKeyword(filteredRoles, keyword, ['name', 'code', 'description']);
    }

    return HttpResponse.json(createPaginatedResponse(filteredRoles, page, pageSize));
  }),

  // 获取所有角色（不分页）
  http.get('/api/roles/all', async () => {
    await delay();
    
    return HttpResponse.json(createSuccessResponse(mockRoles));
  }),

  // 获取角色详情
  http.get('/api/roles/:id', async ({ params }) => {
    await delay();
    
    const { id } = params;
    const role = mockRoles.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(createErrorResponse('角色不存在', 404));
    }
    
    return HttpResponse.json(createSuccessResponse(role));
  }),

  // 创建角色
  http.post('/api/roles', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    
    // 检查角色代码是否已存在
    if (mockRoles.some(r => r.code === body.code)) {
      return HttpResponse.json(createErrorResponse('角色代码已存在', 400));
    }
    
    // 检查角色名称是否已存在
    if (mockRoles.some(r => r.name === body.name)) {
      return HttpResponse.json(createErrorResponse('角色名称已存在', 400));
    }
    
    const newRole = {
      id: (mockRoles.length + 1).toString(),
      name: body.name,
      code: body.code,
      description: body.description || '',
      permissions: body.permissions || [],
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockRoles.push(newRole);
    
    return HttpResponse.json(createSuccessResponse(newRole, '角色创建成功'));
  }),

  // 更新角色
  http.put('/api/roles/:id', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return HttpResponse.json(createErrorResponse('角色不存在', 404));
    }
    
    // 检查角色代码是否已被其他角色使用
    if (body.code && mockRoles.some(r => r.code === body.code && r.id !== id)) {
      return HttpResponse.json(createErrorResponse('角色代码已存在', 400));
    }
    
    // 检查角色名称是否已被其他角色使用
    if (body.name && mockRoles.some(r => r.name === body.name && r.id !== id)) {
      return HttpResponse.json(createErrorResponse('角色名称已存在', 400));
    }
    
    const updatedRole = {
      ...mockRoles[roleIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    mockRoles[roleIndex] = updatedRole;
    
    return HttpResponse.json(createSuccessResponse(updatedRole, '角色更新成功'));
  }),

  // 删除角色
  http.delete('/api/roles/:id', async ({ params }) => {
    await delay();
    
    const { id } = params;
    
    if (id === '1') {
      return HttpResponse.json(createErrorResponse('不能删除超级管理员角色', 403));
    }
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return HttpResponse.json(createErrorResponse('角色不存在', 404));
    }
    
    mockRoles.splice(roleIndex, 1);
    
    return HttpResponse.json(createSuccessResponse(null, '角色删除成功'));
  }),

  // 分配权限
  http.post('/api/roles/:id/permissions', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    
    if (roleIndex === -1) {
      return HttpResponse.json(createErrorResponse('角色不存在', 404));
    }
    
    mockRoles[roleIndex].permissions = body.permissionIds;
    mockRoles[roleIndex].updatedAt = new Date().toISOString();
    
    return HttpResponse.json(createSuccessResponse(null, '权限分配成功'));
  }),

  // 获取角色权限
  http.get('/api/roles/:id/permissions', async ({ params }) => {
    await delay();
    
    const { id } = params;
    const role = mockRoles.find(r => r.id === id);
    
    if (!role) {
      return HttpResponse.json(createErrorResponse('角色不存在', 404));
    }
    
    const rolePermissions = mockPermissions.filter(p => 
      role.permissions.includes(p.code) || role.permissions.includes('*')
    );
    
    return HttpResponse.json(createSuccessResponse(rolePermissions));
  }),

  // 获取权限列表
  http.get('/api/permissions', async () => {
    await delay();
    
    return HttpResponse.json(createSuccessResponse(mockPermissions));
  }),

  // 获取权限树
  http.get('/api/permissions/tree', async () => {
    await delay();
    
    // 按模块分组权限
    const permissionTree = mockPermissions.reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = {
          id: module,
          name: module,
          children: [],
        };
      }
      acc[module].children.push(permission);
      return acc;
    }, {} as any);
    
    return HttpResponse.json(createSuccessResponse(Object.values(permissionTree)));
  }),

  // 复制角色
  http.post('/api/roles/:id/copy', async ({ params, request }) => {
    await delay();
    
    const { id } = params;
    const body = await request.json() as any;
    
    const sourceRole = mockRoles.find(r => r.id === id);
    
    if (!sourceRole) {
      return HttpResponse.json(createErrorResponse('源角色不存在', 404));
    }
    
    // 检查新角色名称是否已存在
    if (mockRoles.some(r => r.name === body.name)) {
      return HttpResponse.json(createErrorResponse('角色名称已存在', 400));
    }
    
    const newRole = {
      id: (mockRoles.length + 1).toString(),
      name: body.name,
      code: `${sourceRole.code}_copy_${Date.now()}`,
      description: `${sourceRole.description} (复制)`,
      permissions: [...sourceRole.permissions],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockRoles.push(newRole);
    
    return HttpResponse.json(createSuccessResponse(newRole, '角色复制成功'));
  }),

  // 批量删除角色
  http.post('/api/roles/batch-delete', async ({ request }) => {
    await delay();
    
    const body = await request.json() as any;
    const { ids } = body;
    
    if (ids.includes('1')) {
      return HttpResponse.json(createErrorResponse('不能删除超级管理员角色', 403));
    }
    
    mockRoles = mockRoles.filter(role => !ids.includes(role.id));
    
    return HttpResponse.json(createSuccessResponse(null, '批量删除成功'));
  }),
];