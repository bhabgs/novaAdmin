import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Space, Select, message, Popconfirm, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MenuOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchMenus,
  fetchUserMenus,
  deleteMenu,
  batchDeleteMenus,
} from "@/store/slices/menuSlice";
import { Menu } from "@/types/menu";
import MenuForm from "./MenuForm";
import CrudPage, { FilterConfig, ToolbarButton } from "@/components/CrudPage";

const { Option } = Select;

const MenuList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { menus, loading } = useAppSelector((state) => state.menu);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  // 将菜单数据转换为树形结构
  const buildMenuTree = useCallback((menus: Menu[]): Menu[] => {
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus;
  }, []);

  // 过滤菜单数据
  const filterMenus = useCallback((menus: Menu[]): Menu[] => {
    return menus.filter((menu) => {
      const matchesSearch =
        !searchText ||
        menu.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (menu.path &&
          menu.path.toLowerCase().includes(searchText.toLowerCase()));
      const matchesStatus = !statusFilter || menu.status === statusFilter;
      const matchesType = !typeFilter || menu.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchText, statusFilter, typeFilter]);

  const filteredMenus = useMemo(
    () => filterMenus(menus),
    [filterMenus, menus]
  );

  const treeData = useMemo(
    () => buildMenuTree(filteredMenus),
    [buildMenuTree, filteredMenus]
  );

  const handleAdd = useCallback(() => {
    setEditingMenu(null);
    setIsFormVisible(true);
  }, []);

  const handleEdit = useCallback((record: Menu) => {
    setEditingMenu(record);
    setIsFormVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteMenu(id)).unwrap();
        message.success(t("menu.deleteSuccess"));
        dispatch(fetchMenus());
      } catch {
        message.error(t("message.error"));
      }
    },
    [dispatch, t]
  );

  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t("menu.selectMenus"));
      return;
    }

    try {
      await dispatch(batchDeleteMenus(selectedRowKeys as string[])).unwrap();
      message.success(t("menu.deleteSuccess"));
      setSelectedRowKeys([]);
      dispatch(fetchMenus());
    } catch {
      message.error(t("message.error"));
    }
  }, [dispatch, selectedRowKeys, t]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleRefreshRoutes = useCallback(() => {
    dispatch(fetchMenus());
    dispatch(fetchUserMenus());
    message.success(t("menu.refreshRoutesSuccess"));
  }, [dispatch, t]);

  const handleExport = useCallback(() => {
    try {
      // 导出树形结构，保留层级关系
      const dataStr = JSON.stringify(menus, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `menus-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(t("menu.exportSuccess"));
    } catch {
      message.error(t("message.error"));
    }
  }, [menus, t]);

  const handleExpandedRowsChange = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys);
  }, []);

  const handleFormSubmit = useCallback(() => {
    setIsFormVisible(false);
    setEditingMenu(null);
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleFormCancel = useCallback(() => {
    setIsFormVisible(false);
    setEditingMenu(null);
  }, []);

  const getMenuIcon = (type: string) => {
    switch (type) {
      case "directory":
        return <FolderOutlined style={{ color: "#1890ff" }} />;
      case "page":
        return <FileOutlined style={{ color: "#52c41a" }} />;
      case "button":
        return <AppstoreOutlined style={{ color: "#faad14" }} />;
      default:
        return <MenuOutlined />;
    }
  };

  const columns = useMemo(() => {
    const getStatusTag = (status: string) => {
      return status === "active" ? (
        <Tag color="success">{t("common.active")}</Tag>
      ) : (
        <Tag color="error">{t("common.inactive")}</Tag>
      );
    };

    const getTypeTag = (type: string) => {
      const typeMap = {
        directory: { color: "blue", text: t("menu.directory") },
        page: { color: "green", text: t("menu.page") },
        iframe: { color: "purple", text: t("menu.iframe") },
        button: { color: "orange", text: t("menu.button") },
      };
      const config = typeMap[type as keyof typeof typeMap];
      return config ? <Tag color={config.color}>{config.text}</Tag> : <Tag>{type}</Tag>;
    };

    return [
      {
        title: t("menu.menuName"),
        dataIndex: "name",
        key: "name",
        render: (text: string, record: Menu) => (
          <Space>
            {getMenuIcon(record.type)}
            <span>{text}</span>
          </Space>
        ),
      },
      {
        title: t("menu.menuPath"),
        dataIndex: "path",
        key: "path",
        render: (text: string) => (
          <code
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: "3px",
            }}
          >
            {text || "-"}
          </code>
        ),
      },
      {
        title: t("menu.menuType"),
        dataIndex: "type",
        key: "type",
        render: (type: string) => getTypeTag(type),
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        key: "status",
        render: (status: string) => getStatusTag(status),
      },
      {
        title: t("menu.sortOrder"),
        dataIndex: "sortOrder",
        key: "sortOrder",
        width: 100,
        sorter: (a: Menu, b: Menu) => a.sortOrder - b.sortOrder,
      },
      {
        title: t("common.createTime"),
        dataIndex: "createTime",
        key: "createTime",
        width: 180,
        render: (text: string) =>
          text ? new Date(text).toLocaleString() : "-",
      },
    ];
  }, [t]);

  // 自定义操作列渲染
  const operationColumnRender = useCallback(
    (record: Menu) => (
      <Space size="small">
        <Tooltip title={t("common.edit")}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Popconfirm
          title={t("menu.confirmDelete")}
          onConfirm={() => handleDelete(record.id)}
          okText={t("common.confirm")}
          cancelText={t("common.cancel")}
        >
          <Tooltip title={t("common.delete")}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
    [handleEdit, handleDelete, t]
  );

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      },
    }),
    [selectedRowKeys]
  );

  // 过滤器配置
  const filters: FilterConfig[] = useMemo(
    () => [
      {
        key: "type",
        span: 4,
        component: (
          <Select
            placeholder={t("menu.filterByType")}
            allowClear
            style={{ width: "100%" }}
            value={typeFilter || undefined}
            onChange={setTypeFilter}
          >
            <Option value="directory">{t("menu.directory")}</Option>
            <Option value="page">{t("menu.page")}</Option>
            <Option value="button">{t("menu.button")}</Option>
          </Select>
        ),
      },
      {
        key: "status",
        span: 4,
        component: (
          <Select
            placeholder={t("common.filterByStatus")}
            allowClear
            style={{ width: "100%" }}
            value={statusFilter || undefined}
            onChange={setStatusFilter}
          >
            <Option value="active">{t("common.active")}</Option>
            <Option value="inactive">{t("common.inactive")}</Option>
          </Select>
        ),
      },
    ],
    [typeFilter, statusFilter, t]
  );

  // 工具栏按钮配置
  const toolbarButtons: ToolbarButton[] = useMemo(
    () => [
      {
        key: "refreshRoutes",
        label: t("menu.refreshRoutes"),
        icon: <ReloadOutlined />,
        type: "primary",
        tooltip: t("menu.refreshRoutesTooltip"),
        onClick: handleRefreshRoutes,
      },
      {
        key: "export",
        label: t("menu.exportJson"),
        icon: <ExportOutlined />,
        tooltip: t("menu.exportJsonTooltip"),
        onClick: handleExport,
      },
    ],
    [handleRefreshRoutes, handleExport, t]
  );

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  return (
    <>
      <CrudPage<Menu>
        title={t("menu.title")}
        dataSource={treeData}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        pagination={false}
        searchPlaceholder={t("menu.searchPlaceholder")}
        onSearch={handleSearch}
        filters={filters}
        toolbarButtons={toolbarButtons}
        addButtonText={t("menu.addMenu")}
        batchDeleteButtonText={t("common.batchDelete")}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBatchDelete={handleBatchDelete}
        onRefresh={handleRefresh}
        deleteConfirmTitle={t("menu.confirmDelete")}
        operationColumnWidth={200}
        operationColumnRender={operationColumnRender}
        tableProps={{
          expandable: {
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: handleExpandedRowsChange,
            defaultExpandAllRows: true,
          },
          size: "middle",
        }}
      />

      <MenuForm
        visible={isFormVisible}
        menu={editingMenu}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </>
  );
};

export default MenuList;
