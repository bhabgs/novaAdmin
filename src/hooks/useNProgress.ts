import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';

// 配置 NProgress
NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: true,
  trickleSpeed: 100, // 加快涓流速度
  minimum: 0.1,
  trickle: true,
});

/**
 * 路由切换进度条 Hook
 * 在路由变化时自动显示/隐藏顶部进度条
 */
export const useNProgress = () => {
  const location = useLocation();

  useEffect(() => {
    // 路由开始变化时启动进度条
    NProgress.start();

    // 延迟完成，给组件更多加载时间
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);
};

/**
 * 手动控制进度条
 */
export const progress = {
  start: () => NProgress.start(),
  done: () => NProgress.done(),
  set: (n: number) => NProgress.set(n),
  inc: (amount?: number) => NProgress.inc(amount),
};

export default useNProgress;
