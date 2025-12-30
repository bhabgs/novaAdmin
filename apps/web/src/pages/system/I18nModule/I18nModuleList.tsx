import React, { useCallback } from "react";
import { Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchI18nModules,
  deleteI18nModule,
} from "@/store/slices/i18nModuleSlice";
import type { I18nModule } from "@/types/i18n";
import I18nModuleForm from "./I18nModuleForm";
import CrudPage from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

const I18nModuleList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: modules, loading, pagination } = useAppSelector((state) => state.i18nModule);

  const {
    selectedRowKeys,
    isModalVisible,
    editingItem: editingModule,
    setIsModalVisible,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    rowSelection,
    paginationConfig,
  } = useListManagement<I18nModule>({
    dispatch,
    fetchAction: fetchI18nModules,
    deleteAction: deleteI18nModule,
    loadingSelector: loading,
    totalSelector: pagination.total,
    deleteSuccessKey: "i18nModule.deleteSuccess",
    selectWarningKey: "i18nModule.selectModules",
    deleteConfirmKey: "i18nModule.confirmDelete",
    batchDeleteConfirmKey: "i18nModule.batchDeleteConfirm",
  });

  // 自定义操作列渲染
  const operationColumnRender = useCallback(
    (record: I18nModule) => {
      return (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("i18nModule.confirmDelete")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t("common.delete")}
            </Button>
          </Popconfirm>
        </Space>
      );
    },
    [handleEdit, handleDelete, t]
  );

  // 表格列配置
  const columns = [
    {
      title: t("i18nModule.code"),
      dataIndex: "code",
      key: "code",
      sorter: true,
    },
    {
      title: t("i18nModule.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("i18nModule.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("common.remark"),
      dataIndex: "remark",
      key: "remark",
    },
  ];

  return (
    <>
      <CrudPage
        title={t("i18nModule.title")}
        columns={columns}
        dataSource={modules}
        loading={loading}
        pagination={paginationConfig}
        rowSelection={rowSelection}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBatchDelete={handleBatchDelete}
        onRefresh={handleRefresh}
        selectedRowKeys={selectedRowKeys}
        operationColumnRender={operationColumnRender}
        deleteConfirmTitle={t("i18nModule.confirmDelete")}
      />
      <I18nModuleForm
        visible={isModalVisible}
        module={editingModule}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          handleRefresh();
        }}
      />
    </>
  );
};

export default I18nModuleList;

