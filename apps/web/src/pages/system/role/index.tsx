import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchRoles, deleteRole } from '@/store/slices/roleSlice';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
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

export default function RoleList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.role);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteRole(deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.role')}</h1>
        <Button>
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('role.name')}</TableHead>
              <TableHead>{t('role.code')}</TableHead>
              <TableHead>{t('role.description')}</TableHead>
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
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              list.map((role: any) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.code}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={role.status === 1 ? 'default' : 'destructive'}>
                      {role.status === 1 ? t('common.enabled') : t('common.disabled')}
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
                          onClick={() => setDeleteId(role.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            Total: {pagination.total}
          </span>
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除该角色吗？此操作无法撤销。
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
