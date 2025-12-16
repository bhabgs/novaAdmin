import React from 'react';
import {
  MenuOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  LinkOutlined,
  CodeOutlined,
  SortAscendingOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  TableOutlined,
  FormOutlined,
} from '@ant-design/icons';

export interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const MENU_ICONS: IconOption[] = [
  { value: 'MenuOutlined', label: 'Menu', icon: <MenuOutlined /> },
  { value: 'FolderOutlined', label: 'Folder', icon: <FolderOutlined /> },
  { value: 'FileOutlined', label: 'File', icon: <FileOutlined /> },
  { value: 'AppstoreOutlined', label: 'App', icon: <AppstoreOutlined /> },
  { value: 'LinkOutlined', label: 'Link', icon: <LinkOutlined /> },
  { value: 'CodeOutlined', label: 'Code', icon: <CodeOutlined /> },
  { value: 'SortAscendingOutlined', label: 'Sort', icon: <SortAscendingOutlined /> },
  { value: 'HomeOutlined', label: 'Home', icon: <HomeOutlined /> },
  { value: 'UserOutlined', label: 'User', icon: <UserOutlined /> },
  { value: 'SettingOutlined', label: 'Setting', icon: <SettingOutlined /> },
  { value: 'DashboardOutlined', label: 'Dashboard', icon: <DashboardOutlined /> },
  { value: 'TableOutlined', label: 'Table', icon: <TableOutlined /> },
  { value: 'FormOutlined', label: 'Form', icon: <FormOutlined /> },
];

// Icon mapping for rendering
export const ICON_MAP: Record<string, React.ReactNode> = {
  MenuOutlined: <MenuOutlined />,
  FolderOutlined: <FolderOutlined />,
  FileOutlined: <FileOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  LinkOutlined: <LinkOutlined />,
  CodeOutlined: <CodeOutlined />,
  SortAscendingOutlined: <SortAscendingOutlined />,
  HomeOutlined: <HomeOutlined />,
  UserOutlined: <UserOutlined />,
  SettingOutlined: <SettingOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  TableOutlined: <TableOutlined />,
  FormOutlined: <FormOutlined />,
};

export const getIconByName = (iconName: string): React.ReactNode => {
  return ICON_MAP[iconName] || <MenuOutlined />;
};
