import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchRoles, deleteRole, createRole, updateRole } from '@/store/slices/roleSlice';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CrudPage, Column, FormField } from '@/components/crud-page';

export default function RoleList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((state) => state.role);

  const columns: Column[] = [
    { key: 'name', title: t('role.name') },
    { key: 'code', title: t('role.code') },
    { key: 'description', title: t('role.description') },
    {
      key: 'status',
      title: t('common.status'),
      render: (value) => (
        <Badge variant={value === 1 ? 'default' : 'destructive'}>
          {value === 1 ? t('common.enabled') : t('common.disabled')}
        </Badge>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'name',
      label: '角色名称',
      required: true,
      placeholder: '请输入角色名称',
    },
    {
      name: 'code',
      label: '角色编码',
      required: true,
      placeholder: '请输入角色编码，如 admin',
      disabled: (isEdit) => isEdit,
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '请输入角色描述',
      rows: 3,
    },
    {
      name: 'sort',
      label: '排序',
      type: 'number',
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
      title={t('menu.role')}
      columns={columns}
      formFields={formFields}
      data={list}
      loading={loading}
      pagination={pagination}
      onAdd={async (data) => {
        await dispatch(createRole({ ...data, status: data.status ?? 1, sort: data.sort ?? 0 })).unwrap();
      }}
      onEdit={async (id, data) => {
        await dispatch(updateRole({ id, data })).unwrap();
      }}
      onDelete={async (id) => {
        await dispatch(deleteRole(id)).unwrap();
      }}
      onRefresh={() => {
        dispatch(fetchRoles({ page: 1, pageSize: 10 }));
      }}
      addButtonText={t('common.add')}
      editTitle="编辑角色"
      addTitle="新增角色"
      deleteConfirmTitle={t('common.confirm')}
      deleteConfirmDescription="确定删除该角色吗？此操作无法撤销。"
    />
  );
}
