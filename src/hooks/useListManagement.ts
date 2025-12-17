import { useState, useEffect, useCallback } from "react";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import type { AsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch } from "../store";

interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  [key: string]: unknown;
}

interface UseListManagementOptions {
  dispatch: AppDispatch;
  fetchAction: AsyncThunk<unknown, ListParams, Record<string, never>>;
  deleteAction: AsyncThunk<unknown, string, Record<string, never>>;
  loadingSelector: boolean;
  totalSelector: number;
  initialPageSize?: number;
  deleteSuccessKey?: string;
  selectWarningKey?: string;
  deleteConfirmKey?: string;
  batchDeleteConfirmKey?: string;
  errorKey?: string;
}

interface UseListManagementReturn<T> {
  // State
  selectedRowKeys: React.Key[];
  searchText: string;
  currentPage: number;
  pageSize: number;
  isModalVisible: boolean;
  editingItem: T | null;

  // Actions
  setSelectedRowKeys: (keys: React.Key[]) => void;
  setSearchText: (text: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setIsModalVisible: (visible: boolean) => void;
  setEditingItem: (item: T | null) => void;

  // Handlers
  handleSearch: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (record: T) => void;
  handleDelete: (id: string) => Promise<void>;
  handleBatchDelete: () => void;
  handleRefresh: () => void;
  handlePageChange: (page: number, size?: number) => void;

  // Table props
  rowSelection: {
    selectedRowKeys: React.Key[];
    onChange: (keys: React.Key[]) => void;
  };

  paginationConfig: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger: boolean;
    showQuickJumper: boolean;
    showTotal: (total: number, range: [number, number]) => string;
    onChange: (page: number, size?: number) => void;
  };
}

export function useListManagement<T extends { id: string }>(
  options: UseListManagementOptions
): UseListManagementReturn<T> {
  const {
    dispatch,
    fetchAction,
    deleteAction,
    totalSelector,
    initialPageSize = 10,
    deleteSuccessKey = "message.deleteSuccess",
    selectWarningKey = "message.selectWarning",
    deleteConfirmKey = "message.deleteConfirm",
    batchDeleteConfirmKey = "message.batchDeleteConfirm",
    errorKey = "message.error",
  } = options;

  const { t } = useTranslation();

  // State
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  // Load data function
  const loadData = useCallback(() => {
    dispatch(
      fetchAction({
        page: currentPage,
        pageSize,
        search: searchText,
      })
    );
  }, [dispatch, fetchAction, currentPage, pageSize, searchText]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setIsModalVisible(true);
  }, []);

  const handleEdit = useCallback((record: T) => {
    setEditingItem(record);
    setIsModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteAction(id)).unwrap();
        message.success(t(deleteSuccessKey));
        loadData();
      } catch (error) {
        console.error("Delete error:", error);
        message.error(t(errorKey));
      }
    },
    [dispatch, deleteAction, loadData, t, deleteSuccessKey, errorKey]
  );

  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning(t(selectWarningKey));
      return;
    }

    Modal.confirm({
      title: t(deleteConfirmKey),
      content: t(batchDeleteConfirmKey, { count: selectedRowKeys.length }),
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await dispatch(deleteAction(id as string)).unwrap();
          }
          message.success(t(deleteSuccessKey));
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          console.error("Batch delete error:", error);
          message.error(t(errorKey));
        }
      },
    });
  }, [
    selectedRowKeys,
    dispatch,
    deleteAction,
    loadData,
    t,
    deleteConfirmKey,
    batchDeleteConfirmKey,
    deleteSuccessKey,
    selectWarningKey,
    errorKey,
  ]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  }, []);

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // Pagination config
  const paginationConfig = {
    current: currentPage,
    pageSize,
    total: totalSelector,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => t("common.total", { count: total }),
    onChange: handlePageChange,
  };

  return {
    // State
    selectedRowKeys,
    searchText,
    currentPage,
    pageSize,
    isModalVisible,
    editingItem,

    // Setters
    setSelectedRowKeys,
    setSearchText,
    setCurrentPage,
    setPageSize,
    setIsModalVisible,
    setEditingItem,

    // Handlers
    handleSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
    handlePageChange,

    // Table props
    rowSelection,
    paginationConfig,
  };
}
