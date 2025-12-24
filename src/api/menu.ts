import { Menu, ApiResponse } from '../types';
import { mockMenus, availableIcons } from '@/data/menus';

// 扁平化菜单树
const flattenMenus = (menus: Menu[]): Menu[] => {
  const result: Menu[] = [];

  const flatten = (items: Menu[]) => {
    items.forEach((item) => {
      // 创建一个不包含 children 的副本
      const { children, ...menuWithoutChildren } = item;
      result.push(menuWithoutChildren as Menu);

      // 递归处理子菜单
      if (children && children.length > 0) {
        flatten(children);
      }
    });
  };

  flatten(menus);
  return result;
};

// 本地菜单列表（扁平化）
let localMenus: Menu[] = flattenMenus(JSON.parse(JSON.stringify(mockMenus)));

// 菜单管理相关API - 使用本地假数据
export const menuApi = {
  // 获取菜单列表（扁平结构）
  getMenus: (): Promise<ApiResponse<Menu[]>> => {
    return Promise.resolve({
      success: true,
      data: localMenus,
      message: '获取成功',
    });
  },

  // 获取用户菜单（根据权限过滤）- 返回树形结构用于左侧导航
  getUserMenus: (): Promise<ApiResponse<Menu[]>> => {
    // 返回原始树形结构用于左侧菜单
    return Promise.resolve({
      success: true,
      data: JSON.parse(JSON.stringify(mockMenus)),
      message: '获取成功',
    });
  },

  // 获取菜单详情
  getMenuById: (id: string): Promise<ApiResponse<Menu>> => {
    const findMenuById = (menus: Menu[]): Menu | null => {
      for (const menu of menus) {
        if (menu.id === id) return menu;
        if (menu.children && menu.children.length > 0) {
          const found = findMenuById(menu.children);
          if (found) return found;
        }
      }
      return null;
    };

    const menu = findMenuById(localMenus);

    if (!menu) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '菜单不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: menu,
      message: '获取成功',
    });
  },

  // 创建菜单
  createMenu: (data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    const newMenu: Menu = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || '',
      i18nKey: data.i18nKey || '',
      type: data.type || 'page',
      path: data.path,
      component: data.component,
      icon: data.icon,
      sortOrder: data.sortOrder || 0,
      status: data.status || 'active',
      parentId: data.parentId,
      children: [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    // 如果有父菜单，添加到父菜单的children中
    if (data.parentId) {
      const findAndAdd = (menus: Menu[]): boolean => {
        for (const menu of menus) {
          if (menu.id === data.parentId) {
            if (!menu.children) menu.children = [];
            menu.children.push(newMenu);
            return true;
          }
          if (menu.children && findAndAdd(menu.children)) return true;
        }
        return false;
      };
      findAndAdd(localMenus);
    } else {
      localMenus.push(newMenu);
    }

    return Promise.resolve({
      success: true,
      data: newMenu,
      message: '创建成功',
    });
  },

  // 更新菜单
  updateMenu: (id: string, data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    const updateMenuById = (menus: Menu[]): Menu | null => {
      for (const menu of menus) {
        if (menu.id === id) {
          Object.assign(menu, data, { updateTime: new Date().toISOString() });
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const updated = updateMenuById(menu.children);
          if (updated) return updated;
        }
      }
      return null;
    };

    const updated = updateMenuById(localMenus);

    if (!updated) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '菜单不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: updated,
      message: '更新成功',
    });
  },

  // 删除菜单
  deleteMenu: (id: string): Promise<ApiResponse<null>> => {
    const deleteMenuById = (menus: Menu[]): boolean => {
      const index = menus.findIndex((m) => m.id === id);
      if (index > -1) {
        menus.splice(index, 1);
        return true;
      }

      for (const menu of menus) {
        if (menu.children && deleteMenuById(menu.children)) {
          return true;
        }
      }

      return false;
    };

    const deleted = deleteMenuById(localMenus);

    if (!deleted) {
      return Promise.resolve({
        success: false,
        data: null,
        message: '菜单不存在',
        code: 404,
      });
    }

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 更新菜单排序
  updateMenuSort: (menus: Menu[]): Promise<ApiResponse<null>> => {
    localMenus = menus;

    return Promise.resolve({
      success: true,
      data: null,
      message: '排序已更新',
    });
  },

  // 获取菜单图标列表
  getMenuIcons: (): Promise<ApiResponse<string[]>> => {
    return Promise.resolve({
      success: true,
      data: availableIcons,
      message: '获取成功',
    });
  },

  // 批量删除菜单
  batchDeleteMenus: (ids: string[]): Promise<ApiResponse<null>> => {
    const deleteMenusById = (menus: Menu[]): Menu[] => {
      return menus.filter((menu) => {
        if (ids.includes(menu.id)) return false;
        if (menu.children) {
          menu.children = deleteMenusById(menu.children);
        }
        return true;
      });
    };

    localMenus = deleteMenusById(localMenus);

    return Promise.resolve({
      success: true,
      data: null,
      message: '删除成功',
    });
  },

  // 复制菜单
  copyMenu: (id: string, parentId?: string): Promise<ApiResponse<Menu>> => {
    const findMenuById = (menus: Menu[]): Menu | null => {
      for (const menu of menus) {
        if (menu.id === id) return menu;
        if (menu.children) {
          const found = findMenuById(menu.children);
          if (found) return found;
        }
      }
      return null;
    };

    const original = findMenuById(localMenus);

    if (!original) {
      return Promise.resolve({
        success: false,
        data: null as any,
        message: '菜单不存在',
        code: 404,
      });
    }

    const copied: Menu = {
      ...original,
      id: Math.random().toString(36).substr(2, 9),
      name: `${original.name}(副本)`,
      parentId: parentId || original.parentId,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: copied,
      message: '复制成功',
    });
  },

  // 移动菜单
  moveMenu: (id: string, parentId: string, index: number): Promise<ApiResponse<null>> => {
    return Promise.resolve({
      success: true,
      data: null,
      message: '移动成功',
    });
  },
};