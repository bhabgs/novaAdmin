import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDepartments, deleteDepartment } from '@/store/slices/departmentSlice';
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function TreeNode({ node, level = 0, onDelete }: { node: any; level?: number; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mr-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <span className="w-7" />
            )}
            <span className="font-medium">{node.name}</span>
          </div>
        </TableCell>
        <TableCell>{node.code || '-'}</TableCell>
        <TableCell>{node.leader || '-'}</TableCell>
        <TableCell>
          <Badge variant={node.status === 1 ? 'default' : 'destructive'}>
            {node.status === 1 ? t('common.enabled') : t('common.disabled')}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(node.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {expanded && hasChildren && node.children.map((child: any) => (
        <TreeNode key={child.id} node={child} level={level + 1} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function DepartmentList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tree, loading } = useAppSelector((state) => state.department);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteDepartment(deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.department')}</h1>
        <Button>
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('department.name')}</TableHead>
              <TableHead>{t('department.code')}</TableHead>
              <TableHead>{t('department.leader')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : tree.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              tree.map((node: any) => <TreeNode key={node.id} node={node} onDelete={handleDeleteClick} />)
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除该部门吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
