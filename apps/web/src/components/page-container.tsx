import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PageContainerProps {
  title: string;
  children: ReactNode;
  toolbarExtra?: ReactNode;
  onAdd?: () => void;
  addButtonText?: string;
}

export function PageContainer({
  title,
  children,
  toolbarExtra,
  onAdd,
  addButtonText = '新增',
}: PageContainerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          {toolbarExtra}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
