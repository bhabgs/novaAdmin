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
      const displayName = menu.nameI18n ? t(menu.nameI18n) : menu.name;
      dispatch(addTab({
        key: location.pathname,
        label: displayName,
        path: location.pathname,
        closable: location.pathname !== '/dashboard',
      }));
    }
  }, [location.pathname, menus, dispatch, t]);

  const currentMenu = findMenuByPath(menus, location.pathname);
  const currentMenuName = currentMenu?.nameI18n ? t(currentMenu.nameI18n) : currentMenu?.name;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            {/* 面包屑 */}
            <nav className="flex items-center gap-1 text-sm">
              <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Link>
              {currentMenu && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span>{currentMenuName}</span>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
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
        <main className="flex-1 overflow-auto p-6">
          <Outlet key={refreshKey} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
