// 本地用户假数据
import { User } from '@/types/user';

// 生成随机ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成随机用户
export const generateUser = (id?: string): User => ({
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

// 生成模拟用户数据
const generateMockUsers = (count: number = 50): User[] => {
  const users: User[] = [];

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

export const mockUsers = generateMockUsers();
