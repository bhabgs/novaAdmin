import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Avatar,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchUsers,
  deleteUser,
  updateUserStatus,
} from "../../store/slices/userSlice";
import type { User } from "../../types/user";
import UserForm from "./UserForm";
import PageContainer from "../../components/PageContainer";

const { Search } = Input;
const { Option } = Select;

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { users, loading, total } = useAppSelector((state) => state.user);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, searchText, statusFilter]);

  const loadUsers = () => {
    dispatch(
      fetchUsers({
        page: currentPage,
        pageSize,
        search: searchText,
        status: statusFilter,
      })
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success(t("user.deleteSuccess"));
      loadUsers();
    } catch (error) {
      message.error(t("message.error"));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t("user.selectUsers"));
      return;
    }

    Modal.confirm({
      title: t("user.confirmDelete"),
      content: t("user.batchDeleteConfirm", { count: selectedRowKeys.length }),
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await dispatch(deleteUser(id as string)).unwrap();
          }
          message.success(t("user.deleteSuccess"));
          setSelectedRowKeys([]);
          loadUsers();
        } catch (error) {
          message.error(t("message.error"));
        }
      },
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await dispatch(updateUserStatus({ id, status })).unwrap();
      message.success(t("user.saveSuccess"));
      loadUsers();
    } catch (error) {
      message.error(t("message.error"));
    }
  };

  const columns = [
    {
      title: t("user.avatar"),
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string, record: User) => (
        <Avatar size={40} src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: t("user.username"),
      dataIndex: "username",
      key: "username",
      sorter: true,
    },
    {
      title: t("user.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("user.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("user.phone"),
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: t("user.roles"),
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <>
          {roles?.map((role) => (
            <Tag key={role} color="blue">
              {role}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: t("user.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string, record: User) => {
        const statusConfig = {
          active: { color: "green", text: t("user.active") },
          inactive: { color: "orange", text: t("user.inactive") },
          banned: { color: "red", text: t("user.banned") },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Select
            value={status}
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="active">
              <Tag color="green">{t("user.active")}</Tag>
            </Option>
            <Option value="inactive">
              <Tag color="orange">{t("user.inactive")}</Tag>
            </Option>
            <Option value="banned">
              <Tag color="red">{t("user.banned")}</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: t("user.lastLoginTime"),
      dataIndex: "lastLoginTime",
      key: "lastLoginTime",
      render: (time: string) => time || "-",
    },
    {
      title: t("common.operation"),
      key: "action",
      width: 200,
      render: (_, record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("user.confirmDelete")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t("common.delete")}
            </Button>
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
    <PageContainer title={t("user.title")} ghost>
      <Card bordered={false}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder={t("user.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder={t("user.filterByStatus")}
              allowClear
              style={{ width: "100%" }}
              onChange={handleStatusFilter}
            >
              <Option value="active">{t("user.active")}</Option>
              <Option value="inactive">{t("user.inactive")}</Option>
              <Option value="banned">{t("user.banned")}</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space style={{ float: "right" }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                {t("user.addUser")}
              </Button>
              <Button
                danger
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchDelete}
              >
                {t("user.batchDelete")}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadUsers}>
                {t("common.refresh")}
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => t("common.total", { count: total }),
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
        />
      </Card>

      <UserForm
        visible={isModalVisible}
        user={editingUser}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          loadUsers();
        }}
      />
    </PageContainer>
  );
};

export default UserList;
