import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column, DataTableProps } from './data-table';
import { CrudDialog, DeleteDialog, FormField } from './crud-dialog';
import { PageContainer } from './page-container';

// Re-export types for backward compatibility
export type { Column, FormField };

export interface CrudPageProps<T = any> {
  title: string;
  columns: Column<T>[];
  formFields: FormField[];
  data: T[];
  loading?: boolean;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
  onAdd?: (data: any) => Promise<void>;
  onEdit?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  getRowKey?: (record: T) => string;
  canEdit?: (record: T) => boolean;
  canDelete?: (record: T) => boolean;
  renderActions?: (record: T) => ReactNode;
  addButtonText?: string;
  editTitle?: string;
  addTitle?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  treeMode?: boolean;
  childrenKey?: string;
  defaultExpandAll?: boolean;
  toolbarExtra?: ReactNode;
  renderRow?: (record: T, defaultRow: ReactNode) => ReactNode;
  extraRowActions?: (record: T) => ReactNode;
}

export function CrudPage<T extends Record<string, any>>({
  title,
  columns,
  formFields,
  data,
  loading = false,
  pagination,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  getRowKey = (record) => record.id,
  canEdit,
  canDelete,
  renderActions,
  addButtonText = '新增',
  editTitle = '编辑',
  addTitle = '新增',
  deleteConfirmTitle = '确认删除',
  deleteConfirmDescription = '确定删除该项吗？此操作无法撤销。',
  treeMode = false,
  childrenKey = 'children',
  defaultExpandAll = false,
  toolbarExtra,
  renderRow,
  extraRowActions,
}: CrudPageProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);

  const handleAdd = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record: T) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: any, isEdit: boolean) => {
    try {
      if (isEdit && editingRecord && onEdit) {
        await onEdit(getRowKey(editingRecord), formData);
        toast.success('更新成功');
      } else if (onAdd) {
        await onAdd(formData);
        toast.success('创建成功');
      }
      onRefresh?.();
    } catch (error) {
      toast.error(isEdit ? '更新失败' : '创建失败');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (deleteId && onDelete) {
      try {
        await onDelete(deleteId);
        toast.success('删除成功');
        onRefresh?.();
      } catch (error) {
        toast.error('删除失败');
        throw error;
      }
    }
  };

  return (
    <PageContainer
      title={title}
      toolbarExtra={toolbarExtra}
      onAdd={onAdd ? handleAdd : undefined}
      addButtonText={addButtonText}
    >
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        getRowKey={getRowKey}
        treeMode={treeMode}
        childrenKey={childrenKey}
        defaultExpandAll={defaultExpandAll}
        renderRow={renderRow}
        onEdit={onEdit ? handleEdit : undefined}
        onDelete={onDelete ? (record) => setDeleteId(getRowKey(record)) : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        renderActions={renderActions}
        extraRowActions={extraRowActions}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formFields={formFields}
        editingRecord={editingRecord}
        onSubmit={handleSubmit}
        editTitle={editTitle}
        addTitle={addTitle}
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={deleteConfirmTitle}
        description={deleteConfirmDescription}
      />
    </PageContainer>
  );
}
