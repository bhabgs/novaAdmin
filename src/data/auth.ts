// 本地认证假数据
export const mockAuthUsers = [
  {
    id: '1',
    username: 'admin',
    password: '123456',
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
    password: '123456',
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

// 生成 Token
export const generateToken = (userId: string): { token: string; refreshToken: string } => {
  return {
    token: `mock_token_${Date.now()}_${Math.random()}`,
    refreshToken: `mock_refresh_token_${Date.now()}_${Math.random()}`,
  };
};
