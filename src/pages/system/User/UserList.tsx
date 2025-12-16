import React, { useState, useCallback } from "react";
import { Select, Tag, Avatar, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchUsers,
  deleteUser,
  updateUserStatus,
} from "@/store/slices/userSlice";
import type { User } from "@/types/user";
import UserForm from "./UserForm";
import CrudPage, { FilterConfig } from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

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
    deleteSuccessKey: "user.deleteSuccess",
    selectWarningKey: "user.selectUsers",
    deleteConfirmKey: "user.confirmDelete",
    batchDeleteConfirmKey: "user.batchDeleteConfirm",
  });

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        await dispatch(updateUserStatus({ id, status })).unwrap();
        message.success(t("user.saveSuccess"));
        handleRefresh();
      } catch (error) {
        console.error("Status change error:", error);
        message.error(t("message.error"));
      }
    },
    [dispatch, t, handleRefresh]
  );

  // 表格列配置
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
  ];

  // 过滤器配置
  const filters: FilterConfig[] = [
    {
      key: "status",
      span: 4,
      component: (
        <Select
          placeholder={t("user.filterByStatus")}
          allowClear
          style={{ width: "100%" }}
          onChange={setStatusFilter}
          value={statusFilter || undefined}
        >
          <Option value="active">{t("user.active")}</Option>
          <Option value="inactive">{t("user.inactive")}</Option>
          <Option value="banned">{t("user.banned")}</Option>
        </Select>
      ),
    },
  ];

  return (
    <>
      <CrudPage<User>
        title={t("user.title")}
        dataSource={users}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        pagination={paginationConfig}
        searchPlaceholder={t("user.searchPlaceholder")}
        onSearch={handleSearch}
        filters={filters}
        addButtonText={t("user.addUser")}
        batchDeleteButtonText={t("user.batchDelete")}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBatchDelete={handleBatchDelete}
        onRefresh={handleRefresh}
        deleteConfirmTitle={t("user.confirmDelete")}
      />

      <UserForm
        visible={isModalVisible}
        user={editingUser}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          handleRefresh();
        }}
      />
    </>
  );
};

export default UserList;
