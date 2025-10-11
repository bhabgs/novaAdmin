import { generateId } from '../../utils/format';

// 模拟延迟
export const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 创建成功响应
export const createSuccessResponse = <T>(data: T, message = '操作成功') => ({
  success: true,
  code: 200,
  message,
  data,
  timestamp: Date.now(),
});

// 创建错误响应
export const createErrorResponse = (message = '操作失败', code = 400) => ({
  success: false,
  code,
  message,
  data: null,
  timestamp: Date.now(),
});

// 创建分页响应
export const createPaginatedResponse = <T>(
  list: T[],
  page: number = 1,
  pageSize: number = 10,
  total?: number
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedList = list.slice(startIndex, endIndex);
  
  return createSuccessResponse({
    list: paginatedList,
    pagination: {
      page,
      pageSize,
      total: total || list.length,
    },
  });
};

// 生成随机用户数据
export const generateUser = (id?: string) => ({
  id: id || generateId(),
  username: `user_${Math.random().toString(36).substr(2, 8)}`,
  email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
  name: `用户${Math.random().toString(36).substr(2, 4)}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
  phone: `138${Math.random().toString().substr(2, 8)}`,
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  roles: ['user'],
  permissions: ['read'],
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
});

// 生成随机角色数据
export const generateRole = (id?: string) => ({
  id: id || generateId(),
  name: `角色${Math.random().toString(36).substr(2, 4)}`,
  code: `role_${Math.random().toString(36).substr(2, 6)}`,
  description: `这是一个测试角色`,
  permissions: ['read', 'write'],
  status: 'active',
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
});

// 生成随机菜单数据
export const generateMenu = (id?: string, parentId?: string) => ({
  id: id || generateId(),
  name: `菜单${Math.random().toString(36).substr(2, 4)}`,
  path: `/menu${Math.random().toString(36).substr(2, 4)}`,
  component: 'Layout',
  icon: 'MenuOutlined',
  sort: Math.floor(Math.random() * 100),
  status: 'active',
  parentId: parentId || null,
  children: [],
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
});

// 生成图表数据
export const generateChartData = (count: number = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      name: date.toLocaleDateString(),
      value: Math.floor(Math.random() * 1000) + 100,
      date: date.toISOString(),
    });
  }
  
  return data;
};

// 模拟搜索过滤
export const filterByKeyword = <T extends Record<string, any>>(
  list: T[],
  keyword: string,
  fields: (keyof T)[]
): T[] => {
  if (!keyword) return list;
  
  return list.filter(item =>
    fields.some(field =>
      String(item[field]).toLowerCase().includes(keyword.toLowerCase())
    )
  );
};

// 模拟排序
export const sortBy = <T>(
  list: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...list].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};