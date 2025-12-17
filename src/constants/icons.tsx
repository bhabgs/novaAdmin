import React from 'react';
import * as AntdIcons from '@ant-design/icons';

export interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// 过滤掉非图标组件
const EXCLUDED_ICONS = [
  'createFromIconfontCN',
  'default',
  'getTwoToneColor',
  'setTwoToneColor',
];

// 动态生成所有 Ant Design 图标选项
export const MENU_ICONS: IconOption[] = Object.keys(AntdIcons)
  .filter(
    (key) =>
      !EXCLUDED_ICONS.includes(key) &&
      key !== key.toLowerCase() &&
      typeof (AntdIcons as any)[key] === 'object'
  )
  .map((name) => {
    const IconComponent = (AntdIcons as any)[name];
    return {
      value: name,
      label: name,
      icon: React.createElement(IconComponent),
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label)); // 按字母排序

// Icon mapping for rendering
export const ICON_MAP: Record<string, React.ReactNode> = MENU_ICONS.reduce(
  (map, icon) => {
    map[icon.value] = icon.icon;
    return map;
  },
  {} as Record<string, React.ReactNode>
);

export const getIconByName = (iconName: string): React.ReactNode => {
  if (!iconName) return null;
  const IconComponent = (AntdIcons as any)[iconName];
  if (!IconComponent) return null;
  return React.createElement(IconComponent);
};
