import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers, deleteUser } from '@/store/slices/userSlice';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function UserList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('确定删除该用户吗？')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.user')}</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">{t('user.username')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('user.nickname')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('user.email')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('user.status')}</th>
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
              list.map((user: any) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td className="px-4 py-3 text-sm">{user.nickname || '-'}</td>
                  <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs ${
                        user.status === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status === 1 ? t('common.enabled') : t('common.disabled')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-accent rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 hover:bg-accent rounded text-destructive"
                        onClick={() => handleDelete(user.id)}
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
