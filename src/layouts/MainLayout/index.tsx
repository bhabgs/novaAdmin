import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Drawer } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  MenuOutlined as MenuIcon,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, fetchUserInfo } from "@/store/slices/authSlice";
import { fetchUserMenus } from "@/store/slices/menuSlice";
import { toggleSidebar } from "@/store/slices/settingsSlice";
import CustomBreadcrumb from "@/components/Breadcrumb";
import PageTabs from "@/components/PageTabs";
import { Menu as MenuType } from "@/types/menu";
import styles from "./index.module.less";

const { Header, Sider } = Layout;

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { userMenus } = useAppSelector((state) => state.menu);
  const { layout } = useAppSelector((state) => state.settings);
  const {
    sidebarCollapsed,
    sidebarWidth,
    sidebarTheme,
    fixedHeader,
    showTabs,
  } = layout;

  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检查屏幕尺寸
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // 获取用户信息和菜单
    if (!user) {
      dispatch(fetchUserInfo());
    }
    dispatch(fetchUserMenus());
  }, [dispatch, user]);

  // 生成菜单项
  const generateMenuItems = (menuData: MenuType[]) => {
    return menuData.map((menu) => {
      const icon = getMenuIcon(menu.icon);
      // 使用 i18nKey 或回退到 name
      const label = menu.i18nKey ? t(menu.i18nKey) : menu.name;

      if (menu.children && menu.children.length > 0) {
        // 创建副本并排序，避免修改只读数组
        const sortedChildren = [...menu.children]
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .filter((menu1) => !menu1.hideInMenu);
        return {
          key: menu.id,
          icon,
          label,
          children: generateMenuItems(sortedChildren),
        };
      }

      return {
        key: menu.id,
        icon,
        label,
        onClick: () => {
          // 如果是 iframe 类型且设置为在新标签页打开
          if (menu.type === "iframe" && menu.openInNewTab && menu.externalUrl) {
            window.open(menu.externalUrl, "_blank", "noopener,noreferrer");
          } else {
            navigate(menu.path || "/");
          }
          if (isMobile) {
            setMobileDrawerVisible(false);
          }
        },
      };
    });
  };

  // 获取菜单图标
  const getMenuIcon = (iconName?: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      DashboardOutlined: <DashboardOutlined />,
      UserOutlined: <UserOutlined />,
      TeamOutlined: <TeamOutlined />,
      MenuOutlined: <MenuIcon />,
      SettingOutlined: <SettingOutlined />,
      LinkOutlined: <LinkOutlined />,
      FileTextOutlined: <FileTextOutlined />,
    };

    return iconMap[iconName || ""] || <MenuIcon />;
  };

  // 获取当前选中的菜单
  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    const findMenuByPath = (
      menuData: MenuType[],
      path: string
    ): string | null => {
      for (const menu of menuData) {
        if (menu.path === path) {
          return menu.id;
        }
        if (menu.children) {
          const found = findMenuByPath(menu.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedKey = findMenuByPath(userMenus, currentPath);
    return selectedKey ? [selectedKey] : [];
  };

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("menu.profile"),
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: t("menu.systemSettings"),
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("auth.logout"),
      onClick: handleLogout,
    },
  ];

  // 侧边栏内容
  const sidebarContent = (
    <div className={styles.siderContent}>
      {/* Logo */}
      <div className={styles.logo}>
        {!sidebarCollapsed ? (
          <div className={styles.logoFull}>
            <div className={styles.logoIcon}>
              <span>N</span>
            </div>
            <span className={styles.logoText}>NovaAdmin</span>
          </div>
        ) : (
          <div className={styles.logoIcon}>
            <span>N</span>
          </div>
        )}
      </div>

      {/* 菜单 */}
      <div className={styles.menuContainer}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={generateMenuItems(userMenus)}
          className={styles.menu}
          inlineCollapsed={sidebarCollapsed}
        />
      </div>
    </div>
  );

  return (
    <Layout className={styles.mainLayout}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={sidebarCollapsed}
          width={sidebarWidth}
          className={`${styles.sider} ${
            sidebarTheme === "light" ? styles.siderLight : ""
          }`}
          theme={sidebarTheme}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* 移动端抽屉 */}
      {isMobile && (
        <Drawer
          title={t("menu.navigationMenu")}
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          width={200}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout
        className={styles.layout}
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? 80 : sidebarWidth) : 0,
          transition: "margin-left 0.2s ease",
        }}
      >
        {/* 顶部导航 */}
        <Header
          className={`${styles.header} ${
            fixedHeader ? styles.fixedHeader : ""
          }`}
        >
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={
                sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => {
                if (isMobile) {
                  setMobileDrawerVisible(true);
                } else {
                  dispatch(toggleSidebar());
                }
              }}
              className={styles.trigger}
            />

            <CustomBreadcrumb />
          </div>

          <div className={styles.headerRight}>
            {/* 通知 */}
            <div className={styles.headerAction}>
              <Badge count={5} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className={styles.actionButton}
                />
              </Badge>
            </div>

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className={styles.userInfo}>
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />
                <span className={styles.userName}>
                  {user?.name || user?.username || t("menu.user")}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        {/* 标签页 */}
        {showTabs && <PageTabs />}
        {/* 主内容区域 */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
