import { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TabsNav } from '@/components/tabs-nav';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addTab } from '@/store/slices/tabsSlice';
import { findMenuByPath } from '@/utils/dynamicRoutes';
import { Bell, Home } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { tree: menus } = useAppSelector((state) => state.menu);
  const { user } = useAppSelector((state) => state.auth);
  const { refreshKey } = useAppSelector((state) => state.tabs);

  useEffect(() => {
    const menu = findMenuByPath(menus, location.pathname);
    if (menu) {
      const translated = menu.nameI18n ? t(menu.nameI18n) : '';
      const displayName = (translated && translated !== menu.nameI18n) ? translated : menu.name;
      dispatch(addTab({
        key: location.pathname,
        label: displayName,
        path: location.pathname,
        closable: location.pathname !== '/dashboard',
        nameI18n: menu.nameI18n, // 传入国际化 key
      }));
    }
  }, [location.pathname, menus, dispatch, t]);

  const currentMenu = findMenuByPath(menus, location.pathname);
  const currentTranslated = currentMenu?.nameI18n ? t(currentMenu.nameI18n) : '';
  const currentMenuName = (currentTranslated && currentTranslated !== currentMenu?.nameI18n) ? currentTranslated : currentMenu?.name;

  return (
    <SidebarProvider>
      {/* 跳过导航链接 - 仅对键盘用户可见 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        跳过导航
      </a>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-4" role="banner">
          <div className="flex items-center gap-2">
            <SidebarTrigger aria-label="切换侧边栏" />
            <Separator orientation="vertical" className="h-4" aria-hidden="true" />
            {/* 面包屑 */}
            <nav className="flex items-center gap-1 text-sm" aria-label="面包屑导航">
              <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>首页</span>
              </Link>
              {currentMenu && (
                <>
                  <span className="text-muted-foreground" aria-hidden="true">/</span>
                  <span aria-current="page">{currentMenuName}</span>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative" aria-label="通知，5条未读消息">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center" aria-hidden="true">
                5
              </span>
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user?.username || '用户'}</span>
            </div>
          </div>
        </header>

        {/* 标签页 */}
        <TabsNav />

        {/* 主内容区 - 滚动只在这里发生 */}
        <main id="main-content" className="flex-1 overflow-auto p-6" role="main">
          <Outlet key={refreshKey} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
