import type { Menu } from '../types/menu';

export interface MenuTreeNode {
  value: string;
  title: string;
  key: string;
  children: MenuTreeNode[];
  disabled?: boolean;
}

/**
 * Build a tree structure for parent menu selection
 * @param menus - All menus
 * @param currentMenuId - Current menu ID (to prevent selecting self as parent)
 * @returns Tree data for TreeSelect component
 */
export function buildMenuTree(
  menus: Menu[],
  currentMenuId?: string
): MenuTreeNode[] {
  const menuMap = new Map<string, MenuTreeNode>();
  const rootMenus: MenuTreeNode[] = [];

  // Filter out button type menus - only directories and pages can be parents
  const validParentMenus = menus.filter((m) => m.type !== 'button');

  // Create menu nodes
  validParentMenus.forEach((menu) => {
    menuMap.set(menu.id, {
      value: menu.id,
      title: menu.name,
      key: menu.id,
      children: [],
      disabled: currentMenuId === menu.id, // Disable selecting self as parent
    });
  });

  // Build tree structure
  validParentMenus.forEach((menu) => {
    const menuItem = menuMap.get(menu.id);
    if (!menuItem) return;

    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId);
      parent?.children.push(menuItem);
    } else {
      rootMenus.push(menuItem);
    }
  });

  return rootMenus;
}

/**
 * Flatten menu tree to array
 * @param menus - Menu tree
 * @returns Flattened menu array
 */
export function flattenMenuTree(menus: Menu[]): Menu[] {
  const result: Menu[] = [];

  function flatten(menu: Menu) {
    result.push(menu);
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(flatten);
    }
  }

  menus.forEach(flatten);
  return result;
}

/**
 * Find menu by ID
 * @param menus - Menu array
 * @param id - Menu ID
 * @returns Found menu or undefined
 */
export function findMenuById(menus: Menu[], id: string): Menu | undefined {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuById(menu.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Get all parent menu IDs
 * @param menus - Menu array
 * @param menuId - Current menu ID
 * @returns Array of parent menu IDs
 */
export function getParentMenuIds(menus: Menu[], menuId: string): string[] {
  const parentIds: string[] = [];

  function findParents(targetId: string): boolean {
    for (const menu of menus) {
      if (menu.id === targetId) {
        return true;
      }
      if (menu.children && menu.children.length > 0) {
        if (findParents(targetId)) {
          parentIds.unshift(menu.id);
          return true;
        }
      }
    }
    return false;
  }

  findParents(menuId);
  return parentIds;
}
