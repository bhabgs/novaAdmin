import { ReactNode, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
  width?: string;
}

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'custom';
  required?: boolean;
  disabled?: (isEdit: boolean) => boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  render?: (value: any, onChange: (value: any) => void, formData: any) => ReactNode;
  rows?: number;
}

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
  renderActions?: (record: T) => ReactNode;
  addButtonText?: string;
  editTitle?: string;
  addTitle?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
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
  renderActions,
  addButtonText = '新增',
  editTitle = '编辑',
  addTitle = '新增',
  deleteConfirmTitle = '确认删除',
  deleteConfirmDescription = '确定删除该项吗？此操作无法撤销。',
}: CrudPageProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const initFormData = (record?: T) => {
    const data: Record<string, any> = {};
    formFields.forEach((field) => {
      data[field.name] = record?.[field.name] ?? '';
    });
    return data;
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData(initFormData());
    setDialogOpen(true);
  };

  const handleEdit = (record: T) => {
    setEditingRecord(record);
    setFormData(initFormData(record));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填项
    const missingFields = formFields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast.error(`请填写必填项: ${missingFields.join(', ')}`);
      return;
    }

    try {
      if (editingRecord && onEdit) {
        await onEdit(getRowKey(editingRecord), formData);
        toast.success('更新成功');
      } else if (onAdd) {
        await onAdd(formData);
        toast.success('创建成功');
      }
      setDialogOpen(false);
      onRefresh?.();
    } catch (error) {
      toast.error(editingRecord ? '更新失败' : '创建失败');
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
      }
      setDeleteId(null);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.name];
    const onChange = (newValue: any) => {
      setFormData({ ...formData, [field.name]: newValue });
    };

    const isDisabled = field.disabled?.(!!editingRecord) ?? false;

    if (field.render) {
      return field.render(value, onChange, formData);
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            rows={field.rows || 3}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            disabled={isDisabled}
          />
        );
      case 'select':
        return (
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            required={field.required}
          />
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {onAdd && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} style={{ width: col.width }}>
                  {col.title}
                </TableHead>
              ))}
              {(onEdit || onDelete || renderActions) && (
                <TableHead className="text-right">操作</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center h-32">
                  加载中...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center h-32 text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow key={getRowKey(record)}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(record[col.key], record) : record[col.key] || '-'}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || renderActions) && (
                    <TableCell className="text-right">
                      {renderActions ? (
                        renderActions(record)
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(record)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                编辑
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(getRowKey(record))}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">总计: {pagination.total}</span>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRecord ? editTitle : addTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {formFields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>
                    {field.required && <span className="text-destructive mr-1">*</span>}
                    {field.label}
                  </Label>
                  {renderFormField(field)}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
