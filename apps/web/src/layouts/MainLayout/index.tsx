import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Menu as MenuIcon,
  LogOut,
  ChevronLeft,
  Settings,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'menu.dashboard' },
  {
    label: 'menu.system',
    icon: Settings,
    children: [
      { path: '/system/user', icon: Users, label: 'menu.user' },
      { path: '/system/role', icon: Shield, label: 'menu.role' },
      { path: '/system/department', icon: Building2, label: 'menu.department' },
      { path: '/system/menu', icon: MenuIcon, label: 'menu.menu' },
    ],
  },
];

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['menu.system']);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label],
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!collapsed && <span className="font-semibold">Nova Admin</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-accent rounded">
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {menuItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent',
                    collapsed && 'justify-center',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="flex-1 text-left">{t(item.label)}</span>}
                </button>
                {!collapsed && openMenus.includes(item.label) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent',
                          location.pathname === child.path && 'bg-accent',
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        <span>{t(child.label)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path!}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent',
                  location.pathname === item.path && 'bg-accent',
                  collapsed && 'justify-center',
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{t(item.label)}</span>}
              </Link>
            ),
          )}
        </nav>

        <div className="border-t p-2">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent',
              collapsed && 'justify-center',
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>{user?.username}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
