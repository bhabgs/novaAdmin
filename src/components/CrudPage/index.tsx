import React, { ReactNode, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Row,
  Col,
  Popconfirm,
  Modal,
  Form,
  Tooltip,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { FormInstance } from "antd/es/form";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/PageContainer";

const { Search } = Input;

/**
 * 搜索过滤器配置
 */
export interface FilterConfig {
  key: string;
  placeholder?: string;
  component: ReactNode;
  span?: number;
}

/**
 * 工具栏按钮配置
 */
export interface ToolbarButton {
  key: string;
  label: string;
  icon?: ReactNode;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * CrudPage 组件属性
 */
export interface CrudPageProps<T extends { id: string }> {
  // 页面标题
  title: string;

  // 表格数据
  dataSource: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);

  // 表格列配置
  columns: ColumnsType<T>;

  // 分页配置
  pagination?: TableProps<T>["pagination"];

  // 行选择配置
  rowSelection?: TableProps<T>["rowSelection"];
  selectedRowKeys?: React.Key[];

  // 搜索配置
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;

  // 额外的过滤器
  filters?: FilterConfig[];

  // 工具栏按钮
  toolbarButtons?: ToolbarButton[];

  // 默认操作按钮
  showAddButton?: boolean;
  showBatchDeleteButton?: boolean;
  showRefreshButton?: boolean;

  // 添加按钮文本
  addButtonText?: string;
  batchDeleteButtonText?: string;

  // 事件处理
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (id: string) => void;
  onBatchDelete?: () => void;
  onRefresh?: () => void;

  // 表单模态框配置
  modalVisible?: boolean;
  modalTitle?: string;
  modalWidth?: number;
  editingRecord?: T | null;
  onModalCancel?: () => void;
  onModalOk?: () => void;
  modalLoading?: boolean;
  formInstance?: FormInstance;
  formContent?: ReactNode;

  // 操作列配置
  showOperationColumn?: boolean;
  operationColumnWidth?: number;
  operationColumnRender?: (record: T) => ReactNode;
  deleteConfirmTitle?: string;

  // 额外内容
  extraContent?: ReactNode;

  // 表格额外属性
  tableProps?: Omit<TableProps<T>, "columns" | "dataSource" | "loading" | "rowKey" | "pagination" | "rowSelection">;
}

/**
 * 通用 CRUD 页面组件
 *
 * 使用示例:
 * ```tsx
 * <CrudPage
 *   title="用户管理"
 *   dataSource={users}
 *   columns={columns}
 *   loading={loading}
 *   pagination={paginationConfig}
 *   rowSelection={rowSelection}
 *   selectedRowKeys={selectedRowKeys}
 *   searchPlaceholder="搜索用户"
 *   onSearch={handleSearch}
 *   onAdd={handleAdd}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onBatchDelete={handleBatchDelete}
 *   onRefresh={handleRefresh}
 *   modalVisible={isModalVisible}
 *   modalTitle={editingUser ? "编辑用户" : "添加用户"}
 *   onModalCancel={() => setIsModalVisible(false)}
 *   formContent={<UserFormFields />}
 * />
 * ```
 */
function CrudPage<T extends { id: string }>({
  title,
  dataSource,
  loading = false,
  rowKey = "id",
  columns,
  pagination,
  rowSelection,
  selectedRowKeys = [],
  searchPlaceholder,
  onSearch,
  filters = [],
  toolbarButtons = [],
  showAddButton = true,
  showBatchDeleteButton = true,
  showRefreshButton = true,
  addButtonText,
  batchDeleteButtonText,
  onAdd,
  onEdit,
  onDelete,
  onBatchDelete,
  onRefresh,
  modalVisible = false,
  modalTitle,
  modalWidth = 600,
  editingRecord,
  onModalCancel,
  onModalOk,
  modalLoading = false,
  formInstance,
  formContent,
  showOperationColumn = true,
  operationColumnWidth = 180,
  operationColumnRender,
  deleteConfirmTitle,
  extraContent,
  tableProps,
}: CrudPageProps<T>) {
  const { t } = useTranslation();

  // 默认操作列
  const defaultOperationColumn = useMemo(() => {
    if (!showOperationColumn) return null;

    return {
      title: t("common.operation"),
      key: "operation",
      width: operationColumnWidth,
      fixed: "right" as const,
      render: (_: unknown, record: T) => {
        if (operationColumnRender) {
          return operationColumnRender(record);
        }

        return (
          <Space size="small">
            {onEdit && (
              <Tooltip title={t("common.edit")}>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                />
              </Tooltip>
            )}
            {onDelete && (
              <Popconfirm
                title={deleteConfirmTitle || t("common.deleteConfirm")}
                onConfirm={() => onDelete(record.id)}
                okText={t("common.confirm")}
                cancelText={t("common.cancel")}
              >
                <Tooltip title={t("common.delete")}>
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    };
  }, [
    showOperationColumn,
    operationColumnWidth,
    operationColumnRender,
    onEdit,
    onDelete,
    deleteConfirmTitle,
    t,
  ]);

  // 合并列配置
  const mergedColumns = useMemo(() => {
    if (!defaultOperationColumn) return columns;
    return [...columns, defaultOperationColumn];
  }, [columns, defaultOperationColumn]);

  // 渲染搜索栏
  const renderSearchBar = () => {
    const searchColSpan = filters.length > 0 ? 6 : 8;
    const filtersTotalSpan = filters.reduce((sum, f) => sum + (f.span || 4), 0);
    const buttonsSpan = 24 - searchColSpan - filtersTotalSpan;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* 搜索框 */}
        {onSearch && (
          <Col span={searchColSpan}>
            <Search
              placeholder={searchPlaceholder || t("common.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={onSearch}
            />
          </Col>
        )}

        {/* 额外过滤器 */}
        {filters.map((filter) => (
          <Col key={filter.key} span={filter.span || 4}>
            {filter.component}
          </Col>
        ))}

        {/* 工具栏按钮 */}
        <Col span={onSearch ? buttonsSpan : 24}>
          <Space style={{ float: "right" }}>
            {/* 添加按钮 */}
            {showAddButton && onAdd && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                {addButtonText || t("common.add")}
              </Button>
            )}

            {/* 批量删除按钮 */}
            {showBatchDeleteButton && onBatchDelete && (
              <Button
                danger
                disabled={selectedRowKeys.length === 0}
                onClick={onBatchDelete}
              >
                {batchDeleteButtonText || t("common.batchDelete")}
              </Button>
            )}

            {/* 自定义工具栏按钮 */}
            {toolbarButtons.map((btn) => (
              <Button
                key={btn.key}
                type={btn.type}
                danger={btn.danger}
                disabled={btn.disabled}
                icon={btn.icon}
                onClick={btn.onClick}
              >
                {btn.label}
              </Button>
            ))}

            {/* 刷新按钮 */}
            {showRefreshButton && onRefresh && (
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                {t("common.refresh")}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    );
  };

  // 渲染表单模态框
  const renderModal = () => {
    if (!formContent) return null;

    return (
      <Modal
        title={modalTitle || (editingRecord ? t("common.edit") : t("common.add"))}
        open={modalVisible}
        width={modalWidth}
        onCancel={onModalCancel}
        onOk={onModalOk}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        {formInstance ? (
          <Form form={formInstance} layout="vertical">
            {formContent}
          </Form>
        ) : (
          formContent
        )}
      </Modal>
    );
  };

  return (
    <PageContainer title={title} ghost>
      <Card bordered={false}>
        {renderSearchBar()}

        {extraContent}

        <Table
          rowSelection={rowSelection}
          columns={mergedColumns}
          dataSource={dataSource}
          rowKey={rowKey}
          loading={loading}
          pagination={pagination}
          {...tableProps}
        />
      </Card>

      {renderModal()}
    </PageContainer>
  );
}

export default CrudPage;
