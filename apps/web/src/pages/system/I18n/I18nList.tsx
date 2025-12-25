import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Space, message, Modal, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store';
import { useListManagement } from '@/hooks/useListManagement';
import CrudPage from '@/components/CrudPage';
import { I18nTranslation, Language } from '@/types/i18n';
import { refreshTranslations } from '@/i18n';
import {
  fetchI18nTranslations,
  fetchI18nModules,
  deleteI18nTranslation,
  batchDeleteI18nTranslations,
  clearError,
} from '@/store/slices/i18nSlice';
import I18nForm from './I18nForm';
import ImportExportModal from './ImportExportModal';

const I18nList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { translations, modules, pagination, loading, error } = useAppSelector(
    state => state.i18n,
  );

  const [form] = Form.useForm();
  const [language, setLanguage] = useState<Language | undefined>();
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
        language,
        module,
        keyword: searchText,
      }),
    );
  }, [currentPage, pageSize, language, module, searchText, dispatch]);

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
      message.warning(t('message.selectWarning'));
      return;
    }

    Modal.confirm({
      title: t('message.batchDeleteConfirm'),
      content: t('message.deleteContent', { count: selectedRowKeys.length }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(
            batchDeleteI18nTranslations({
              ids: selectedRowKeys.map(key => String(key)),
            }),
          ).unwrap();
          message.success(t('message.deleteSuccess'));
          setSelectedRowKeys([]);
          handleRefresh();
        } catch (err) {
          message.error(t('message.deleteError'));
        }
      },
    });
  };

  // Handle refresh cache for frontend
  const handleRefreshCache = async () => {
    setRefreshingCache(true);
    try {
      await refreshTranslations();
      message.success(t('i18n.refreshCacheSuccess') || 'Cache refreshed successfully');
    } catch (err) {
      message.error(t('i18n.refreshCacheError') || 'Failed to refresh cache');
    } finally {
      setRefreshingCache(false);
    }
  };

  // Table columns definition
  const columns: ColumnsType<I18nTranslation> = [
    {
      title: t('i18n.language'),
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: text => <span className="tag">{text}</span>,
    },
    {
      title: t('i18n.module'),
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: text => <span className="tag-blue">{text}</span>,
    },
    {
      title: t('i18n.key'),
      dataIndex: 'key',
      key: 'key',
      width: 200,
      ellipsis: true,
      render: text => <code>{text}</code>,
    },
    {
      title: t('i18n.value'),
      dataIndex: 'value',
      key: 'value',
      render: text => (
        <div style={{ maxWidth: 300, wordBreak: 'break-word' }}>
          {text}
        </div>
      ),
    },
    {
      title: t('common.remark'),
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
      render: text => text || '-',
    },
  ];

  // Filter components
  const filters = [
    {
      key: 'language',
      span: 6,
      component: (
        <Select
          placeholder={t('i18n.selectLanguage')}
          allowClear
          value={language}
          onChange={setLanguage}
          options={[
            { label: '中文', value: 'zh-CN' as Language },
            { label: 'English', value: 'en-US' as Language },
            { label: 'العربية', value: 'ar-SA' as Language },
          ]}
        />
      ),
    },
    {
      key: 'module',
      span: 6,
      component: (
        <Select
          placeholder={t('i18n.selectModule')}
          allowClear
          value={module}
          onChange={setModule}
          options={modules.map(m => ({ label: m, value: m }))}
        />
      ),
    },
  ];

  // Toolbar buttons
  const toolbarButtons = [
    {
      key: 'refresh-cache',
      label: t('i18n.refreshCache') || 'Refresh Cache',
      icon: <ReloadOutlined />,
      type: 'default' as const,
      onClick: handleRefreshCache,
      disabled: refreshingCache,
    },
    {
      key: 'import-export',
      label: t('i18n.importExport') || 'Import/Export',
      icon: <ImportOutlined />,
      type: 'default' as const,
      onClick: () => setShowImportExport(true),
    },
  ];

  return (
    <>
      <CrudPage<I18nTranslation>
        title={t('i18n.title') || 'i18n Management'}
        dataSource={translations}
        loading={loading || refreshingCache}
        columns={columns}
        pagination={paginationConfig}
        rowSelection={rowSelection}
        selectedRowKeys={selectedRowKeys}
        searchPlaceholder={t('i18n.searchPlaceholder') || 'Search by key or value...'}
        onSearch={handleSearch}
        filters={filters}
        toolbarButtons={toolbarButtons}
        showAddButton={true}
        showBatchDeleteButton={true}
        showRefreshButton={true}
        addButtonText={t('common.add')}
        batchDeleteButtonText={t('common.batchDelete')}
        onAdd={handleAdd}
        onEdit={record => {
          setEditingItem(record);
          setIsModalVisible(true);
        }}
        onDelete={handleDelete}
        onBatchDelete={handleConfirmBatchDelete}
        onRefresh={handleRefresh}
        modalVisible={isModalVisible}
        modalTitle={editingItem ? t('common.edit') : t('common.add')}
        modalWidth={600}
        editingRecord={editingItem}
        onModalCancel={() => {
          setIsModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onModalOk={() => {
          // Form submission handled in I18nForm
        }}
        formContent={
          <I18nForm
            editingItem={editingItem}
            onSuccess={() => {
              setIsModalVisible(false);
              setEditingItem(null);
              form.resetFields();
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
          message.success(t('i18n.importSuccess') || 'Import successful');
          handleRefresh();
        }}
      />
    </>
  );
};

export default I18nList;
