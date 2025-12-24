import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface CustomBreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  items,
  showHome = true
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // 根据路径生成面包屑
  const generateBreadcrumbFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // 添加首页
    if (showHome) {
      breadcrumbItems.push({
        title: t('menu.dashboard'),
        path: '/dashboard',
        icon: <HomeOutlined />
      });
    }

    // 路径映射
    const pathMap: Record<string, string> = {
      'users': t('menu.userManagement'),
      'roles': t('menu.roleManagement'),
      'menus': t('menu.menuManagement'),
      'settings': t('menu.systemSettings'),
      'add': t('common.add'),
      'edit': t('common.edit'),
      'detail': t('common.detail')
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // 跳过ID参数
      if (/^\d+$/.test(segment)) {
        return;
      }

      const title = pathMap[segment] || segment;
      
      // 最后一个不添加链接
      if (index === pathSegments.length - 1) {
        breadcrumbItems.push({ title });
      } else {
        breadcrumbItems.push({ title, path: currentPath });
      }
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = items || generateBreadcrumbFromPath();

  const antdItems = breadcrumbItems.map((item, index) => ({
    title: item.path ? (
      <a onClick={() => navigate(item.path!)}>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </a>
    ) : (
      <>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </>
    )
  }));

  return (
    <Breadcrumb
      items={antdItems}
      style={{ margin: '16px 0' }}
    />
  );
};

export default CustomBreadcrumb;