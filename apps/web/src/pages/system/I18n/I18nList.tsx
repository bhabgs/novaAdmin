import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  message,
  Modal,
  Spin,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "@/store";
import { useListManagement } from "@/hooks/useListManagement";
import CrudPage from "@/components/CrudPage";
import { refreshTranslations } from "@/i18n";
import {
  fetchI18nTranslations,
  fetchI18nModules,
  deleteI18nTranslation,
  batchDeleteI18nTranslations,
  clearError,
  type I18nTranslation,
} from "@/store/slices/i18nSlice";
import I18nForm, { type I18nFormRef } from "./I18nForm";
import ImportExportModal from "./ImportExportModal";

const I18nList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formRef = useRef<I18nFormRef>(null);

  const { translations, modules, pagination, loading, error } = useAppSelector(
    (state) => state.i18n
  );

  const [module, setModule] = useState<string | undefined>();
  const [showImportExport, setShowImportExport] = useState(false);
  const [refreshingCache, setRefreshingCache] = useState(false);

  // Use list management hook
  const {
    selectedRowKeys,
    setSelectedRowKeys,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isModalVisible,
    setIsModalVisible,
    editingItem,
    setEditingItem,
    handleSearch,
    handleAdd,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    handlePageChange,
    rowSelection,
    paginationConfig,
  } = useListManagement({
    dispatch,
    fetchAction: fetchI18nTranslations,
    deleteAction: deleteI18nTranslation,
    totalSelector: pagination.total,
    loadingSelector: loading,
    initialPageSize: 50,
  });

  // Fetch data when filters change
  useEffect(() => {
    dispatch(
      fetchI18nTranslations({
        page: currentPage,
        pageSize,
        module,
        keyword: searchText,
      })
    );
  }, [currentPage, pageSize, module, searchText, dispatch]);

  // Fetch modules for filter dropdown
  useEffect(() => {
    dispatch(fetchI18nModules());
  }, [dispatch]);

  // Clear error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle batch delete with confirmation
  const handleConfirmBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t("message.selectWarning"));
      return;
    }

    Modal.confirm({
      title: t("message.batchDeleteConfirm"),
      content: t("message.deleteContent", { count: selectedRowKeys.length }),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(
            batchDeleteI18nTranslations({
              ids: selectedRowKeys.map((key) => String(key)),
            })
          ).unwrap();
          message.success(t("message.deleteSuccess"));
          setSelectedRowKeys([]);
          handleRefresh();
        } catch (err) {
          message.error(t("message.deleteError"));
        }
      },
    });
  };

  // Handle refresh cache for frontend
  const handleRefreshCache = async () => {
    setRefreshingCache(true);
    try {
      await refreshTranslations();
      message.success(
        t("i18n.refreshCacheSuccess") || "Cache refreshed successfully"
      );
    } catch (err) {
      message.error(t("i18n.refreshCacheError") || "Failed to refresh cache");
    } finally {
      setRefreshingCache(false);
    }
  };

  // Handle copy to clipboard - copy as t('module.key') format
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t("common.copySuccess") || "复制成功");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        message.success(t("common.copySuccess") || "复制成功");
      } catch (fallbackErr) {
        message.error(t("common.copyError") || "复制失败");
      }
      document.body.removeChild(textArea);
    }
  };

  // Generate t('module.key') format
  const generateTFunction = (module: string, key: string) => {
    return `t('${module}.${key}')`;
  };

  // Operation column render with edit, delete and copy buttons
  const operationColumnRender = React.useCallback(
    (record: I18nTranslation) => {
      const copyText = generateTFunction(record.module, record.key);
      return (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              setIsModalVisible(true);
            }}
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("common.deleteConfirm") || "确定要删除吗？"}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t("common.delete")}
            </Button>
          </Popconfirm>
          <Tooltip title={`${t("common.copy") || "复制"}: ${copyText}`}>
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(copyText)}
            >
              {t("common.copy") || "复制"}
            </Button>
          </Tooltip>
        </Space>
      );
    },
    [t, handleCopy, handleDelete, setEditingItem, setIsModalVisible]
  );

  // Table columns definition
  const columns: ColumnsType<I18nTranslation> = [
    {
      title: t("i18n.module"),
      dataIndex: "module",
      key: "module",
      width: 120,
      render: (text) => <span className="tag-blue">{text}</span>,
    },
    {
      title: t("i18n.key"),
      dataIndex: "key",
      key: "key",
      width: 200,
      ellipsis: true,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: "中文",
      dataIndex: "zhCN",
      key: "zhCN",
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 200, wordBreak: "break-word" }}>{text}</div>
      ),
    },
    {
      title: "English",
      dataIndex: "enUS",
      key: "enUS",
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 200, wordBreak: "break-word" }}>{text}</div>
      ),
    },
    {
      title: "العربية",
      dataIndex: "arSA",
      key: "arSA",
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 200, wordBreak: "break-word" }}>{text}</div>
      ),
    },
    {
      title: t("common.remark"),
      dataIndex: "remark",
      key: "remark",
      width: 150,
      ellipsis: true,
      render: (text) => text || "-",
    },
  ];

  // Filter components
  const filters = [
    {
      key: "module",
      span: 6,
      component: (
        <Select
          placeholder={t("i18n.selectModule")}
          allowClear
          value={module}
          onChange={setModule}
          options={(modules || []).map((m) => ({ label: m, value: m }))}
        />
      ),
    },
  ];

  // Toolbar buttons
  const toolbarButtons = [
    {
      key: "refresh-cache",
      label: t("i18n.refreshCache") || "Refresh Cache",
      icon: <ReloadOutlined />,
      type: "default" as const,
      onClick: handleRefreshCache,
      disabled: refreshingCache,
    },
    {
      key: "import-export",
      label: t("i18n.importExport") || "Import/Export",
      icon: <ImportOutlined />,
      type: "default" as const,
      onClick: () => setShowImportExport(true),
    },
  ];

  return (
    <>
      <CrudPage<I18nTranslation>
        title={t("i18n.title") || "i18n Management"}
        dataSource={translations}
        loading={loading || refreshingCache}
        columns={columns}
        pagination={paginationConfig}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        searchPlaceholder={
          t("i18n.searchPlaceholder") || "Search by key or value..."
        }
        onSearch={handleSearch}
        filters={filters}
        toolbarButtons={toolbarButtons}
        showAddButton={true}
        showBatchDeleteButton={true}
        showRefreshButton={true}
        addButtonText={t("common.add")}
        batchDeleteButtonText={t("common.batchDelete")}
        onAdd={handleAdd}
        onEdit={(record) => {
          setEditingItem(record);
          setIsModalVisible(true);
        }}
        onDelete={handleDelete}
        onBatchDelete={handleConfirmBatchDelete}
        onRefresh={handleRefresh}
        operationColumnRender={operationColumnRender}
        operationColumnWidth={200}
        tableProps={{
          scroll: { x: "max-content" },
        }}
        modalVisible={isModalVisible}
        modalTitle={editingItem ? t("common.edit") : t("common.add")}
        modalWidth={600}
        editingRecord={editingItem}
        onModalCancel={() => {
          setIsModalVisible(false);
          setEditingItem(null);
        }}
        onModalOk={() => {
          formRef.current?.submit();
        }}
        formContent={
          <I18nForm
            ref={formRef}
            editingItem={editingItem}
            onSuccess={() => {
              setIsModalVisible(false);
              setEditingItem(null);
              handleRefresh();
            }}
          />
        }
      />

      {/* Import/Export Modal */}
      <ImportExportModal
        visible={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImportSuccess={() => {
          message.success(t("i18n.importSuccess") || "Import successful");
          handleRefresh();
        }}
      />
    </>
  );
};

export default I18nList;
