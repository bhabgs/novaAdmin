import React, { useCallback, useEffect, useState } from "react";
import { Button, Space, Popconfirm, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchI18ns,
  deleteI18n,
  setFilters,
  setSearchKeyword,
  setPagination,
} from "@/store/slices/i18nSlice";
import { fetchI18nModules } from "@/store/slices/i18nModuleSlice";
import type { I18n } from "@/types/i18n";
import I18nForm from "./I18nForm";
import I18nImportModal from "./I18nImportModal";
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
    searchKeyword,
  } = useAppSelector((state) => state.i18n);
  const { items: modules } = useAppSelector((state) => state.i18nModule);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const {
    selectedRowKeys,
    isModalVisible,
    editingItem: editingI18n,
    setIsModalVisible,
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

  // 自定义 handleSearch，更新 store 中的 searchKeyword
  const handleSearch = useCallback(
    (value: string) => {
      dispatch(setSearchKeyword(value));
      dispatch(setPagination({ page: 1 }));
    },
    [dispatch]
  );

  useEffect(() => {
    // 加载多语言模块列表
    dispatch(fetchI18nModules({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  // 当 filters 或 searchKeyword 改变时，重新加载数据
  useEffect(() => {
    dispatch(
      fetchI18ns({
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 10,
        keyword: searchKeyword || undefined,
        filters: filters.moduleId ? { moduleId: filters.moduleId } : undefined,
      })
    );
  }, [
    dispatch,
    filters.moduleId,
    pagination.page,
    pagination.pageSize,
    searchKeyword,
  ]);

  const handleModuleChange = (moduleId: string) => {
    dispatch(setFilters({ moduleId: moduleId || undefined }));
    // 刷新列表，传递当前的 filters 和 searchKeyword
    dispatch(
      fetchI18ns({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchKeyword || undefined,
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
      title: t("common.zhCn"),
      dataIndex: "zhCn",
      key: "zhCn",
      ellipsis: true,
    },
    {
      title: t("common.enUs"),
      dataIndex: "enUs",
      key: "enUs",
      ellipsis: true,
    },
    {
      title: t("common.arSa"),
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

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      key: "import",
      label: t("i18n.import") || "导入",
      icon: <ImportOutlined />,
      type: "default" as const,
      onClick: () => setImportModalVisible(true),
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
        toolbarButtons={toolbarButtons}
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
      <I18nImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onSuccess={() => {
          setImportModalVisible(false);
          handleRefresh();
        }}
      />
    </>
  );
};

export default I18nList;
