import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers, deleteUser, createUser, updateUser } from '@/store/slices/userSlice';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CrudPage, Column, FormField } from '@/components/crud-page';

export default function UserList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.user);

  const columns: Column[] = [
    { key: 'username', title: t('user.username') },
    { key: 'nickname', title: t('user.nickname') },
    { key: 'email', title: t('user.email') },
    {
      key: 'status',
      title: t('user.status'),
      render: (value) => (
        <Badge variant={value === 1 ? 'default' : 'destructive'}>
          {value === 1 ? t('common.enabled') : t('common.disabled')}
        </Badge>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'username',
      label: '用户名',
      required: true,
      placeholder: '请输入用户名',
      disabled: (isEdit) => isEdit,
    },
    {
      name: 'password',
      label: '密码',
      required: true,
      placeholder: '请输入密码',
    },
    {
      name: 'nickname',
      label: '昵称',
      placeholder: '请输入昵称',
    },
    {
      name: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
    },
    {
      name: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
    },
    {
      name: 'status',
      label: '状态',
      type: 'custom',
      render: (value, onChange) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value === 1}
            onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
          />
          <span className="text-sm text-muted-foreground">
            {value === 1 ? '启用' : '禁用'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <CrudPage
      title={t('menu.user')}
      columns={columns}
      formFields={formFields}
      data={list}
      loading={loading}
      pagination={pagination}
      onAdd={async (data) => {
        await dispatch(createUser({ ...data, status: data.status ?? 1 })).unwrap();
      }}
      onEdit={async (id, data) => {
        await dispatch(updateUser({ id, data })).unwrap();
      }}
      onDelete={async (id) => {
        await dispatch(deleteUser(id)).unwrap();
      }}
      onRefresh={() => {
        dispatch(fetchUsers({ page: 1, pageSize: 10 }));
      }}
      addButtonText={t('common.add')}
      editTitle="编辑用户"
      addTitle="新增用户"
      deleteConfirmTitle={t('common.confirm')}
      deleteConfirmDescription="确定删除该用户吗？此操作无法撤销。"
    />
  );
}
