import React, { useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Avatar,
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
import { useListManagement } from "../../hooks/useListManagement";

const { Search } = Input;
const { Option } = Select;

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { users, loading, total } = useAppSelector((state) => state.user);

  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    selectedRowKeys,
    isModalVisible,
    editingItem: editingUser,
    setIsModalVisible,
    setEditingItem: setEditingUser,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    rowSelection,
    paginationConfig,
  } = useListManagement<User>({
    dispatch,
    fetchAction: fetchUsers as any,
    deleteAction: deleteUser,
    loadingSelector: loading,
    totalSelector: total,
    deleteSuccessKey: 'user.deleteSuccess',
    selectWarningKey: 'user.selectUsers',
    deleteConfirmKey: 'user.confirmDelete',
    batchDeleteConfirmKey: 'user.batchDeleteConfirm',
  });

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await dispatch(updateUserStatus({ id, status })).unwrap();
      message.success(t("user.saveSuccess"));
      handleRefresh();
    } catch (error) {
      console.error('Status change error:', error);
      message.error(t("message.error"));
    }
  }, [dispatch, t, handleRefresh]);

  const columns = [
    {
      title: t("user.avatar"),
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string) => (
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
      render: (status: string, record: User) => (
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
      ),
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
      render: (_: unknown, record: User) => (
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
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
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
          pagination={paginationConfig}
        />
      </Card>

      <UserForm
        visible={isModalVisible}
        user={editingUser}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          handleRefresh();
        }}
      />
    </PageContainer>
  );
};

export default UserList;
