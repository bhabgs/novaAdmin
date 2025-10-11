import { http, HttpResponse } from "msw";
import { delay, createSuccessResponse, createErrorResponse } from "./utils";
import i18n from "@/i18n";

// 生成模拟菜单数据
const generateMockMenus = () => {
  return [
    {
      id: "0",
      name: "模板介绍",
      i18nKey: "menu.templateIntroduction",
      type: "page" as const,
      path: "/template-introduction",
      component: "TemplateIntroduction",
      icon: "DashboardOutlined",
      sortOrder: 1,
      status: "active" as const,
      parentId: undefined,
      children: [],
      createTime: "2023-01-01T00:00:00.000Z",
      updateTime: new Date().toISOString(),
    },
    {
      id: "1",
      name: "Dashboard",
      i18nKey: "menu.dashboard",
      type: "page" as const,
      path: "/dashboard",
      component: "Dashboard",
      icon: "DashboardOutlined",
      sortOrder: 1,
      status: "active" as const,
      parentId: undefined,
      children: [],
      createTime: "2023-01-01T00:00:00.000Z",
      updateTime: new Date().toISOString(),
    },
    {
      id: "100",
      name: "系统管理",
      i18nKey: "menu.systemManagement",
      type: "directory" as const,
      // 目录一般无需 path/component，仅作为分组容器
      icon: "SettingOutlined",
      sortOrder: 2,
      status: "active" as const,
      parentId: undefined,
      children: [
        {
          id: "2",
          name: "用户管理",
          i18nKey: "menu.userManagement",
          type: "page" as const,
          path: "/users",
          component: "UserList",
          icon: "UserOutlined",
          // 放入“系统管理”分组，作为其子菜单
          sortOrder: 1,
          status: "active" as const,
          children: [],
          createTime: "2023-01-01T00:00:00.000Z",
          updateTime: new Date().toISOString(),
        },
        {
          id: "3",
          name: "角色管理",
          i18nKey: "menu.roleManagement",
          type: "page" as const,
          path: "/roles",
          component: "RoleList",
          icon: "TeamOutlined",
          sortOrder: 2,
          status: "active" as const,
          children: [],
          createTime: "2023-01-01T00:00:00.000Z",
          updateTime: new Date().toISOString(),
        },
        {
          id: "4",
          name: "菜单管理",
          i18nKey: "menu.menuManagement",
          type: "page" as const,
          path: "/menus",
          component: "MenuList",
          icon: "MenuOutlined",
          sortOrder: 3,
          status: "active" as const,
          children: [],
          createTime: "2023-01-01T00:00:00.000Z",
          updateTime: new Date().toISOString(),
        },
        {
          id: "5",
          name: "系统设置",
          i18nKey: "menu.systemSettings",
          type: "page" as const,
          path: "/settings",
          component: "Settings",
          icon: "SettingOutlined",
          sortOrder: 4,
          status: "active" as const,
          children: [],
          createTime: "2023-01-01T00:00:00.000Z",
          updateTime: new Date().toISOString(),
        },
      ],
      createTime: "2023-01-01T00:00:00.000Z",
      updateTime: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Markdown查看器",
      i18nKey: "menu.markdownViewer",
      type: "page" as const,
      path: "/markdown-viewer",
      component: "MarkdownViewer",
      icon: "FileTextOutlined",
      sortOrder: 3,
      status: "active" as const,
      children: [],
      createTime: "2023-01-01T00:00:00.000Z",
      updateTime: new Date().toISOString(),
    },
    {
      id: "7",
      name: "Iframe查看器",
      i18nKey: "menu.iframeViewer",
      type: "page" as const,
      path: "/iframe-demo",
      component: "IframeDemo",
      icon: "LinkOutlined",
      sortOrder: 4,
      status: "active" as const,
      children: [],
      createTime: "2023-01-01T00:00:00.000Z",
      updateTime: new Date().toISOString(),
    },
  ];
};

// 可用的图标列表
const availableIcons = [
  "DashboardOutlined",
  "UserOutlined",
  "TeamOutlined",
  "MenuOutlined",
  "SettingOutlined",
  "UnorderedListOutlined",
  "PlusOutlined",
  "EditOutlined",
  "DeleteOutlined",
  "SearchOutlined",
  "FileOutlined",
  "FolderOutlined",
  "HomeOutlined",
  "AppstoreOutlined",
  "BarsOutlined",
  "CloudOutlined",
  "UploadOutlined",
  "DownloadOutlined",
  "LockOutlined",
  "UnlockOutlined",
];

let mockMenus = generateMockMenus();

// 扁平化菜单数据（用于查找和操作）
const flattenMenus = (menus: any[]): any[] => {
  const result: any[] = [];

  const flatten = (items: any[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };

  flatten(menus);
  return result;
};

// 根据用户权限过滤菜单
const filterMenusByPermissions = (
  menus: any[],
  permissions: string[]
): any[] => {
  if (permissions.includes("*")) {
    return menus;
  }

  return menus
    .filter((menu) => {
      // 这里可以根据实际需求实现权限过滤逻辑
      // 暂时返回所有菜单
      return true;
    })
    .map((menu) => ({
      ...menu,
      children: menu.children
        ? filterMenusByPermissions(menu.children, permissions)
        : [],
    }));
};

export const menuHandlers = [
  // 获取菜单列表（树形结构）
  http.get("/api/menus", async () => {
    await delay();

    return HttpResponse.json(createSuccessResponse(mockMenus));
  }),

  // 获取用户菜单（根据权限过滤）
  http.get("/api/menus/user", async ({ request }) => {
    await delay();

    // 这里应该根据用户的权限来过滤菜单
    // 暂时返回所有菜单
    const userPermissions = ["*"]; // 从token或用户信息中获取
    const filteredMenus = filterMenusByPermissions(mockMenus, userPermissions);

    return HttpResponse.json(createSuccessResponse(filteredMenus));
  }),

  // 获取菜单详情
  http.get("/api/menus/:id", async ({ params }) => {
    await delay();

    const { id } = params;
    const flatMenus = flattenMenus(mockMenus);
    const menu = flatMenus.find((m) => m.id === id);

    if (!menu) {
      return HttpResponse.json(createErrorResponse("菜单不存在", 404));
    }

    return HttpResponse.json(createSuccessResponse(menu));
  }),

  // 创建菜单
  http.post("/api/menus", async ({ request }) => {
    await delay();

    const body = (await request.json()) as any;

    const flatMenus = flattenMenus(mockMenus);

    // 检查路径是否已存在
    if (body.path && flatMenus.some((m) => m.path === body.path)) {
      return HttpResponse.json(createErrorResponse("菜单路径已存在", 400));
    }

    const newMenu = {
      id: (flatMenus.length + 1).toString(),
      name: body.name,
      i18nKey: body.i18nKey,
      type: body.type || "page",
      path: body.path,
      component: body.component || "Layout",
      icon: body.icon || "MenuOutlined",
      sortOrder: body.sortOrder || 1,
      status: body.status || "active",
      parentId: body.parentId || undefined,
      children: [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    // 如果有父菜单，添加到父菜单的children中
    if (body.parentId) {
      const parentMenu = flatMenus.find((m) => m.id === body.parentId);
      if (parentMenu) {
        parentMenu.children.push(newMenu);
      }
    } else {
      // 否则添加到根级菜单
      mockMenus.push(newMenu);
    }

    return HttpResponse.json(createSuccessResponse(newMenu, "菜单创建成功"));
  }),

  // 更新菜单
  http.put("/api/menus/:id", async ({ params, request }) => {
    await delay();

    const { id } = params;
    const body = (await request.json()) as any;

    const flatMenus = flattenMenus(mockMenus);
    const menuIndex = flatMenus.findIndex((m) => m.id === id);

    if (menuIndex === -1) {
      return HttpResponse.json(createErrorResponse("菜单不存在", 404));
    }

    // 检查路径是否已被其他菜单使用
    if (
      body.path &&
      flatMenus.some((m) => m.path === body.path && m.id !== id)
    ) {
      return HttpResponse.json(createErrorResponse("菜单路径已存在", 400));
    }

    const updatedMenu = {
      ...flatMenus[menuIndex],
      ...body,
      updateTime: new Date().toISOString(),
    };

    // 更新菜单数据
    Object.assign(flatMenus[menuIndex], updatedMenu);

    return HttpResponse.json(
      createSuccessResponse(updatedMenu, "菜单更新成功")
    );
  }),

  // 删除菜单
  http.delete("/api/menus/:id", async ({ params }) => {
    await delay();

    const { id } = params;

    const flatMenus = flattenMenus(mockMenus);
    const menu = flatMenus.find((m) => m.id === id);

    if (!menu) {
      return HttpResponse.json(createErrorResponse("菜单不存在", 404));
    }

    // 检查是否有子菜单
    if (menu.children && menu.children.length > 0) {
      return HttpResponse.json(createErrorResponse("请先删除子菜单", 400));
    }

    // 从父菜单或根菜单中删除
    if (menu.parentId) {
      const parentMenu = flatMenus.find((m) => m.id === menu.parentId);
      if (parentMenu) {
        parentMenu.children = parentMenu.children.filter(
          (child: any) => child.id !== id
        );
      }
    } else {
      mockMenus = mockMenus.filter((m) => m.id !== id);
    }

    return HttpResponse.json(createSuccessResponse(null, "菜单删除成功"));
  }),

  // 更新菜单排序
  http.post("/api/menus/sort", async ({ request }) => {
    await delay();

    const body = (await request.json()) as any;
    const { menus } = body;

    // 更新菜单排序
    mockMenus = menus;

    return HttpResponse.json(createSuccessResponse(null, "菜单排序更新成功"));
  }),

  // 获取菜单图标列表
  http.get("/api/menus/icons", async () => {
    await delay();

    return HttpResponse.json(createSuccessResponse(availableIcons));
  }),

  // 批量删除菜单
  http.post("/api/menus/batch-delete", async ({ request }) => {
    await delay();

    const body = (await request.json()) as any;
    const { ids } = body;

    const flatMenus = flattenMenus(mockMenus);

    // 检查是否有子菜单
    for (const id of ids) {
      const menu = flatMenus.find((m) => m.id === id);
      if (menu && menu.children && menu.children.length > 0) {
        return HttpResponse.json(
          createErrorResponse(`菜单"${menu.name}"有子菜单，请先删除子菜单`, 400)
        );
      }
    }

    // 删除菜单
    const deleteMenuRecursive = (menus: any[]): any[] => {
      return menus.filter((menu) => {
        if (ids.includes(menu.id)) {
          return false;
        }
        if (menu.children) {
          menu.children = deleteMenuRecursive(menu.children);
        }
        return true;
      });
    };

    mockMenus = deleteMenuRecursive(mockMenus);

    return HttpResponse.json(createSuccessResponse(null, "批量删除成功"));
  }),

  // 复制菜单
  http.post("/api/menus/:id/copy", async ({ params, request }) => {
    await delay();

    const { id } = params;
    const body = (await request.json()) as any;

    const flatMenus = flattenMenus(mockMenus);
    const sourceMenu = flatMenus.find((m) => m.id === id);

    if (!sourceMenu) {
      return HttpResponse.json(createErrorResponse("源菜单不存在", 404));
    }

    const newMenu = {
      id: (flatMenus.length + 1).toString(),
      name: `${sourceMenu.name} (复制)`,
      i18nKey: sourceMenu.i18nKey,
      type: sourceMenu.type,
      path: `${sourceMenu.path}_copy_${Date.now()}`,
      component: sourceMenu.component,
      icon: sourceMenu.icon,
      sortOrder: sourceMenu.sortOrder,
      status: "active" as const,
      parentId: body.parentId || sourceMenu.parentId,
      children: [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    // 添加到指定父菜单或根菜单
    if (body.parentId) {
      const parentMenu = flatMenus.find((m) => m.id === body.parentId);
      if (parentMenu) {
        parentMenu.children.push(newMenu);
      }
    } else {
      mockMenus.push(newMenu);
    }

    return HttpResponse.json(createSuccessResponse(newMenu, "菜单复制成功"));
  }),

  // 移动菜单
  http.post("/api/menus/:id/move", async ({ params, request }) => {
    await delay();

    const { id } = params;
    const body = (await request.json()) as any;

    const flatMenus = flattenMenus(mockMenus);
    const menu = flatMenus.find((m) => m.id === id);

    if (!menu) {
      return HttpResponse.json(createErrorResponse("菜单不存在", 404));
    }

    // 这里应该实现菜单移动逻辑
    // 暂时返回成功
    return HttpResponse.json(createSuccessResponse(null, "菜单移动成功"));
  }),
];
