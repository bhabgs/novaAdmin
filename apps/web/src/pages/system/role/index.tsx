import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchRoles, deleteRole } from '@/store/slices/roleSlice';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function RoleList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.role);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('确定删除该角色吗？')) {
      dispatch(deleteRole(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.role')}</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">{t('role.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('role.code')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('role.description')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('common.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              list.map((role: any) => (
                <tr key={role.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">{role.name}</td>
                  <td className="px-4 py-3 text-sm">{role.code}</td>
                  <td className="px-4 py-3 text-sm">{role.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs ${
                        role.status === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {role.status === 1 ? t('common.enabled') : t('common.disabled')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-accent rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 hover:bg-accent rounded text-destructive"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            Total: {pagination.total}
          </span>
        </div>
      </div>
    </div>
  );
}
