import React, { useEffect, useRef } from 'react';
import { Tabs, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addTab,
  removeTab,
  setActiveTab,
  closeOtherTabs,
  closeAllTabs,
  closeRightTabs,
  refreshTab,
} from '../../store/slices/tabsSlice';
import { Menu as MenuType } from '../../types/menu';
import styles from './index.module.less';

const PageTabs: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { items, activeKey } = useAppSelector(state => state.tabs);
  const { userMenus } = useAppSelector(state => state.menu);
  const itemsRef = useRef(items);
  
  // 保持 itemsRef 与 items 同步
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 根据路径查找菜单项
  const findMenuByPath = (menus: MenuType[], path: string): MenuType | null => {
    for (const menu of menus) {
      if (menu.path === path) {
        return menu;
      }
      if (menu.children) {
        const found = findMenuByPath(menu.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // 监听路由变化，自动添加标签页
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 解析查询参数，移除 _refresh 参数（用于刷新组件，不应该创建新tab）
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('_refresh');
    const cleanSearch = searchParams.toString();
    const fullPath = currentPath + (cleanSearch ? `?${cleanSearch}` : ''); // 包含查询参数的完整路径（排除_refresh）

    // 跳过登录页
    if (currentPath === '/login') return;

    // 检查是否已经存在该标签页（使用基础路径匹配，忽略 _refresh 参数）
    const existingTab = itemsRef.current.find(item => {
      const [itemBasePath] = item.path.split('?');
      return itemBasePath === currentPath;
    });

    // 如果标签页已存在，只更新激活状态，不创建新标签页
    if (existingTab) {
      dispatch(setActiveTab(existingTab.key));
      return;
    }

    // 查找当前路径对应的菜单
    const menu = findMenuByPath(userMenus, currentPath);

    if (menu) {
      dispatch(
        addTab({
          key: fullPath, // 使用完整路径作为 key（排除_refresh）
          title: menu.name, // 存储默认标题作为备用
          i18nKey: menu.i18nKey, // 存储国际化 key
          path: fullPath, // 存储完整路径（排除_refresh）
          closable: currentPath !== '/dashboard',
        })
      );
    } else {
      // 如果找不到菜单，使用默认标题
      // 对于 iframe 页面，从 URL 参数中获取标题
      const urlTitle = searchParams.get('title');

      const pathSegments = currentPath.split('/').filter(Boolean);
      const defaultTitle = pathSegments[pathSegments.length - 1] || 'Page';
      const title = urlTitle || defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);

      dispatch(
        addTab({
          key: fullPath, // 使用完整路径作为 key（排除_refresh）
          title: title,
          path: fullPath, // 存储完整路径（排除_refresh）
          closable: currentPath !== '/dashboard',
        })
      );
    }
  }, [location.pathname, location.search, userMenus, dispatch]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key));
    const tab = items.find(item => item.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  // 处理标签页关闭
  const handleTabEdit = (targetKey: any, action: 'add' | 'remove') => {
    if (action === 'remove') {
      const tab = items.find(item => item.key === targetKey);
      if (tab && tab.closable !== false) {
        dispatch(removeTab(targetKey));

        // 如果关闭的是当前激活的标签页，需要导航到新的激活标签页
        if (activeKey === targetKey) {
          const currentIndex = items.findIndex(item => item.key === targetKey);
          const newActiveIndex = currentIndex === 0 ? 0 : currentIndex - 1;
          const newActiveTab = items[newActiveIndex];
          if (newActiveTab) {
            navigate(newActiveTab.path);
          }
        }
      }
    }
  };

  // 刷新标签页组件
  const handleRefreshTab = (tabKey: string) => {
    const tab = items.find(item => item.key === tabKey);
    if (!tab) return;

    // 更新刷新key
    dispatch(refreshTab(tabKey));

    // 通过重新导航来触发组件重新渲染
    // 解析当前路径和查询参数
    const [basePath, queryString] = tab.path.split('?');
    const originalSearchParams = new URLSearchParams(queryString || '');
    
    // 添加刷新时间戳参数
    const refreshParams = new URLSearchParams(originalSearchParams);
    refreshParams.set('_refresh', Date.now().toString());
    
    // 导航到带刷新参数的路径（这会触发路由变化，组件会重新渲染）
    const refreshPath = `${basePath}?${refreshParams.toString()}`;
    navigate(refreshPath, { replace: true });
    
    // 在下一个事件循环中移除刷新参数，恢复原URL
    setTimeout(() => {
      const cleanPath = originalSearchParams.toString() 
        ? `${basePath}?${originalSearchParams.toString()}` 
        : basePath;
      navigate(cleanPath, { replace: true });
    }, 10);
  };

  // 右键菜单
  const getContextMenuItems = (tabKey: string) => {
    const currentIndex = items.findIndex(item => item.key === tabKey);
    const currentTab = items[currentIndex];

    return [
      {
        key: 'refresh',
        label: t('tabs.refresh'),
        onClick: () => {
          // 刷新当前标签页组件
          handleRefreshTab(tabKey);
        },
      },
      {
        key: 'close',
        label: t('tabs.close'),
        disabled: !currentTab?.closable,
        onClick: () => {
          if (currentTab?.closable) {
            dispatch(removeTab(tabKey));
          }
        },
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'closeOthers',
        label: t('tabs.closeOthers'),
        onClick: () => {
          dispatch(closeOtherTabs(tabKey));
          navigate(items.find(item => item.key === tabKey)?.path || '/dashboard');
        },
      },
      {
        key: 'closeRight',
        label: t('tabs.closeRight'),
        disabled: currentIndex === items.length - 1,
        onClick: () => {
          dispatch(closeRightTabs(tabKey));
        },
      },
      {
        key: 'closeAll',
        label: t('tabs.closeAll'),
        onClick: () => {
          dispatch(closeAllTabs());
          navigate('/dashboard');
        },
      },
    ];
  };

  // 自定义标签页渲染
  const renderTabLabel = (tab: typeof items[0]) => {
    // 动态翻译标题
    const displayTitle = tab.i18nKey ? t(tab.i18nKey) : tab.title;

    return (
      <Dropdown
        menu={{ items: getContextMenuItems(tab.key) }}
        trigger={['contextMenu']}
      >
        <span className={styles.tabLabel}>{displayTitle}</span>
      </Dropdown>
    );
  };

  return (
    <div className={styles.pageTabs}>
      <Tabs
        type="editable-card"
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={handleTabEdit}
        hideAdd
        size="small"
        items={items.map(tab => ({
          key: tab.key,
          label: renderTabLabel(tab),
          closable: tab.closable,
        }))}
        className={styles.tabs}
      />
    </div>
  );
};

export default PageTabs;
