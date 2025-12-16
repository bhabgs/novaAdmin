import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MenuOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
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
import PageContainer from "@/components/PageContainer";

const { Search } = Input;
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
  const buildMenuTree = (menus: Menu[]): Menu[] => {
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
  };

  // 过滤菜单数据
  const filterMenus = (menus: Menu[]): Menu[] => {
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
  };

  const filteredMenus = filterMenus(menus);
  const treeData = buildMenuTree(filteredMenus);

  const handleAdd = () => {
    setEditingMenu(null);
    setIsFormVisible(true);
  };

  const handleEdit = (record: Menu) => {
    setEditingMenu(record);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMenu(id)).unwrap();
      message.success(t("menu.deleteSuccess"));
    } catch {
      message.error(t("message.error"));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t("menu.selectMenus"));
      return;
    }

    try {
      await dispatch(batchDeleteMenus(selectedRowKeys as string[])).unwrap();
      message.success(t("menu.deleteSuccess"));
      setSelectedRowKeys([]);
    } catch {
      message.error(t("message.error"));
    }
  };

  const handleFormSubmit = () => {
    setIsFormVisible(false);
    setEditingMenu(null);
    dispatch(fetchMenus());
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingMenu(null);
  };

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
      button: { color: "orange", text: t("menu.button") },
    };
    const config = typeMap[type as keyof typeof typeMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
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
      render: (text: string) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: t("common.operation"),
      key: "operation",
      width: 200,
      render: (_: unknown, record: Menu) => (
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
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <PageContainer title={t("menu.title")} ghost>
      <Card bordered={false}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder={t("menu.searchPlaceholder")}
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder={t("menu.filterByType")}
              allowClear
              style={{ width: "100%" }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="directory">{t("menu.directory")}</Option>
              <Option value="page">{t("menu.page")}</Option>
              <Option value="button">{t("menu.button")}</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder={t("common.filterByStatus")}
              allowClear
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="active">{t("common.active")}</Option>
              <Option value="inactive">{t("common.inactive")}</Option>
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                {t("menu.addMenu")}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchDelete}
              >
                {t("common.batchDelete")}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchMenus())}
              >
                {t("common.refresh")}
              </Button>
              <Tooltip title={t("menu.refreshRoutesTooltip")}>
                <Button
                  type="primary"
                  ghost
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    dispatch(fetchMenus());
                    dispatch(fetchUserMenus());
                    message.success(t("menu.refreshRoutesSuccess"));
                  }}
                >
                  {t("menu.refreshRoutes")}
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={treeData}
          loading={loading}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys([...keys]),
            defaultExpandAllRows: true,
          }}
          size="middle"
        />
      </Card>

      <MenuForm
        visible={isFormVisible}
        menu={editingMenu}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </PageContainer>
  );
};

export default MenuList;
