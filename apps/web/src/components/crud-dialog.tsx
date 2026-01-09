import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  colSpan?: 1 | 2;  // 占用列数，默认1
}

export interface CrudDialogProps<T = any> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formFields: FormField[];
  editingRecord?: T | null;
  onSubmit: (data: any, isEdit: boolean) => Promise<void>;
  editTitle?: string;
  addTitle?: string;
  getInitialData?: (record?: T) => Record<string, any>;
  columns?: 1 | 2;  // 表单列数，默认1
  maxWidth?: string;  // 弹窗最大宽度
}

export function CrudDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  formFields,
  editingRecord,
  onSubmit,
  editTitle = '编辑',
  addTitle = '新增',
  getInitialData,
  columns = 1,
  maxWidth,
}: CrudDialogProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const initFormData = (record?: T | null) => {
    if (getInitialData) {
      return getInitialData(record ?? undefined);
    }
    const data: Record<string, any> = {};
    formFields.forEach((field) => {
      data[field.name] = record?.[field.name] ?? '';
    });
    return data;
  };

  useEffect(() => {
    if (open) {
      setFormData(initFormData(editingRecord));
    }
  }, [open, editingRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = formFields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast.error(`请填写必填项: ${missingFields.join(', ')}`);
      return;
    }

    try {
      await onSubmit(formData, !!editingRecord);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in onSubmit
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth || (columns === 2 ? 'sm:max-w-[700px]' : 'sm:max-w-[500px]')}>
        <DialogHeader>
          <DialogTitle>{editingRecord ? editTitle : addTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={`grid gap-4 py-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {formFields.map((field) => (
              <div key={field.name} className={`grid gap-2 ${field.colSpan === 2 || columns === 1 ? 'col-span-full' : ''}`}>
                <Label htmlFor={field.name}>
                  {field.required && <span className="text-destructive mr-1">*</span>}
                  {field.label}
                </Label>
                {renderFormField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 删除确认对话框
export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '确认删除',
  description = '确定删除该项吗？此操作无法撤销。',
}: DeleteDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in onConfirm
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
