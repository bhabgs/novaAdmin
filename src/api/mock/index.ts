import { setupWorker } from 'msw/browser';
import { authHandlers } from './auth';
import { userHandlers } from './user';
import { roleHandlers } from './role';
import { menuHandlers } from './menu';
import { dashboardHandlers } from './dashboard';
import { notificationHandlers } from './notification';

// 合并所有处理器
const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...roleHandlers,
  ...menuHandlers,
  ...dashboardHandlers,
  ...notificationHandlers,
];

// 创建 worker
export const worker = setupWorker(...handlers);

// 启动 Mock 服务
export const startMockService = async () => {
  const useMock = import.meta.env.VITE_USE_MOCK;
  // 仅由环境变量控制是否启用 Mock（支持生产演示）
  if (useMock === 'true') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          // 使用 BASE_URL 作为前缀，兼容子目录部署（vite.config.ts base: './'）
          url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
      });
      console.log('🚀 Mock Service Worker started');
      console.log('📋 Available endpoints:');
      console.log('  - Auth: /api/auth/*');
      console.log('  - Users: /api/users/*');
      console.log('  - Roles: /api/roles/*');
      console.log('  - Menus: /api/menus/*');
      console.log('  - Dashboard: /api/dashboard/*');
      console.log('  - Notifications: /api/notifications/*');
    } catch (error) {
      console.error('Failed to start Mock Service Worker:', error);
    }
  }
};

// 停止 Mock 服务
export const stopMockService = () => {
  if (worker) {
    worker.stop();
    console.log('🛑 Mock Service Worker stopped');
  }
};

// 重置 Mock 数据
export const resetMockData = () => {
  if (worker) {
    worker.resetHandlers();
    console.log('🔄 Mock data reset');
  }
};

export default worker;