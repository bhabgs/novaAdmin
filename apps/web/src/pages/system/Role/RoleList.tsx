import React, { useState, useCallback } from "react";
import { Button, Space, Tag, Popconfirm, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchRoles, deleteRole } from "@/store/slices/roleSlice";
import type { Role } from "@/types/role";
import RoleForm from "./RoleForm";
import PermissionModal from "./PermissionModal";
import CrudPage from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

const RoleList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { roles, loading, pagination } = useAppSelector((state) => state.role);

  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [permissionRole, setPermissionRole] = useState<Role | null>(null);

  const {
    selectedRowKeys,
    isModalVisible,
    editingItem: editingRole,
    setIsModalVisible,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    rowSelection: baseRowSelection,
    paginationConfig,
  } = useListManagement<Role>({
    dispatch,
    fetchAction: fetchRoles,
    deleteAction: deleteRole,
    loadingSelector: loading,
    totalSelector: pagination.total,
    deleteSuccessKey: "role.deleteSuccess",
    selectWarningKey: "role.selectRoles",
    deleteConfirmKey: "role.confirmDelete",
    batchDeleteConfirmKey: "role.batchDeleteConfirm",
  });

  const handlePermissions = useCallback((record: Role) => {
    setPermissionRole(record);
    setIsPermissionModalVisible(true);
  }, []);

  // Override rowSelection to disable admin role
  const rowSelection = {
    ...baseRowSelection,
    getCheckboxProps: (record: Role) => ({
      disabled: record.code === "admin",
    }),
  };

  // 自定义操作列渲染，包含分配权限按钮
  const operationColumnRender = useCallback(
    (record: Role) => {
      const isProtectedRole = record.code === "admin";

      return (
        <Space size="small">
          <Tooltip title={isProtectedRole ? t("role.adminProtected") : ""}>
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handlePermissions(record)}
              disabled={isProtectedRole}
            >
              {t("role.assignPermissions")}
            </Button>
          </Tooltip>
          <Tooltip title={isProtectedRole ? t("role.adminProtected") : ""}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={isProtectedRole}
            >
              {t("common.edit")}
            </Button>
          </Tooltip>
          <Popconfirm
            title={t("role.confirmDelete")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            disabled={isProtectedRole}
          >
            <Tooltip title={isProtectedRole ? t("role.adminProtected") : ""}>
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={isProtectedRole}
              >
                {t("common.delete")}
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      );
    },
    [handlePermissions, handleEdit, handleDelete, t]
  );

  const columns = [
    {
      title: t("role.roleName"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name: string) => (
        <Space>
          <Tag color="blue" icon={<UserOutlined />}>
            {name}
          </Tag>
        </Space>
      ),
    },
    {
      title: t("role.roleCode"),
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Tag color="geekblue">{code}</Tag>,
    },
    {
      title: t("role.menuCount"),
      dataIndex: "menuIds",
      key: "menuIds",
      render: (menuIds: string[]) => (
        <Tag color="green">
          {menuIds?.length || 0} {t("role.menus")}
        </Tag>
      ),
    },
    {
      title: t("role.userCount"),
      dataIndex: "userCount",
      key: "userCount",
      render: (count: number) => (
        <Tag color="purple">
          {count || 0} {t("role.users")}
        </Tag>
      ),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          active: { color: "green", text: t("role.active") },
          inactive: { color: "orange", text: t("role.inactive") },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: t("common.createTime"),
      dataIndex: "createTime",
      key: "createTime",
      render: (time: string) => time || "-",
    },
  ];

  return (
    <>
      <CrudPage<Role>
        title={t("role.title")}
        dataSource={roles as Role[]}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        pagination={paginationConfig}
        searchPlaceholder={t("role.searchPlaceholder")}
        onSearch={handleSearch}
        addButtonText={t("role.addRole")}
        batchDeleteButtonText={t("role.batchDelete")}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBatchDelete={handleBatchDelete}
        onRefresh={handleRefresh}
        deleteConfirmTitle={t("role.confirmDelete")}
        operationColumnWidth={250}
        operationColumnRender={operationColumnRender}
      />

      <RoleForm
        visible={isModalVisible}
        role={editingRole}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          handleRefresh();
        }}
      />

      <PermissionModal
        visible={isPermissionModalVisible}
        role={permissionRole}
        onCancel={() => setIsPermissionModalVisible(false)}
        onSuccess={() => {
          setIsPermissionModalVisible(false);
          handleRefresh();
        }}
      />
    </>
  );
};

export default RoleList;
