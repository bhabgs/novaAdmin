import React, { useCallback, useEffect } from "react";
import { Button, Space, Popconfirm, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchI18ns, deleteI18n, setFilters } from "@/store/slices/i18nSlice";
import { fetchI18nModules } from "@/store/slices/i18nModuleSlice";
import type { I18n } from "@/types/i18n";
import I18nForm from "./I18nForm";
import CrudPage from "@/components/CrudPage";
import { useListManagement } from "@/hooks/useListManagement";

const { Option } = Select;

const I18nList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    items: i18ns,
    loading,
    pagination,
    filters,
  } = useAppSelector((state) => state.i18n);
  const { items: modules } = useAppSelector((state) => state.i18nModule);

  const {
    selectedRowKeys,
    isModalVisible,
    editingItem: editingI18n,
    setIsModalVisible,
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    rowSelection,
    paginationConfig,
  } = useListManagement<I18n>({
    dispatch,
    fetchAction: fetchI18ns,
    deleteAction: deleteI18n,
    loadingSelector: loading,
    totalSelector: pagination.total,
    deleteSuccessKey: "i18n.deleteSuccess",
    selectWarningKey: "i18n.selectItems",
    deleteConfirmKey: "i18n.confirmDelete",
    batchDeleteConfirmKey: "i18n.batchDeleteConfirm",
  });

  useEffect(() => {
    // 加载多语言模块列表
    dispatch(fetchI18nModules({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  // 当 filters 改变时，重新加载数据（useListManagement 会自动加载，但不会传递 filters）
  useEffect(() => {
    dispatch(
      fetchI18ns({
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 10,
        keyword: undefined,
        filters: filters.moduleId ? { moduleId: filters.moduleId } : undefined,
      })
    );
  }, [dispatch, filters.moduleId, pagination.page, pagination.pageSize]);

  const handleModuleChange = (moduleId: string) => {
    dispatch(setFilters({ moduleId: moduleId || undefined }));
    // 刷新列表，传递当前的 filters
    dispatch(
      fetchI18ns({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: undefined,
        filters: { moduleId: moduleId || undefined },
      })
    );
  };

  // 自定义操作列渲染
  const operationColumnRender = useCallback(
    (record: I18n) => {
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
            title={t("i18n.confirmDelete")}
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
      title: t("i18n.module"),
      dataIndex: ["module", "name"],
      key: "module",
      width: 120,
    },
    {
      title: t("i18n.key"),
      dataIndex: "key",
      key: "key",
      sorter: true,
    },
    {
      title: t("i18n.zhCn"),
      dataIndex: "zhCn",
      key: "zhCn",
      ellipsis: true,
    },
    {
      title: t("i18n.enUs"),
      dataIndex: "enUs",
      key: "enUs",
      ellipsis: true,
    },
    {
      title: t("i18n.arSa"),
      dataIndex: "arSa",
      key: "arSa",
      ellipsis: true,
    },
    {
      title: t("common.remark"),
      dataIndex: "remark",
      key: "remark",
      ellipsis: true,
    },
  ];

  // 过滤器配置
  const filterConfig = [
    {
      key: "moduleId",
      label: t("i18n.module"),
      component: (
        <Select
          placeholder={t("i18n.selectModule")}
          allowClear
          style={{ width: 200 }}
          value={filters.moduleId}
          onChange={handleModuleChange}
        >
          {modules.map((module) => (
            <Option key={module.id} value={module.id}>
              {module.name}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <>
      <CrudPage
        title={t("i18n.title")}
        columns={columns}
        dataSource={i18ns}
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
        filters={filterConfig}
        operationColumnRender={operationColumnRender}
        deleteConfirmTitle={t("i18n.confirmDelete")}
      />
      <I18nForm
        visible={isModalVisible}
        i18n={editingI18n}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          handleRefresh();
        }}
      />
    </>
  );
};

export default I18nList;
