import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDepartments, deleteDepartment, createDepartment, updateDepartment } from '@/store/slices/departmentSlice';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CrudPage, Column, FormField } from '@/components/crud-page';

export default function DepartmentList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tree, loading } = useAppSelector((state) => state.department);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const columns: Column[] = [
    { key: 'name', title: t('department.name') },
    { key: 'code', title: t('department.code') },
    { key: 'leader', title: t('department.leader') },
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
      label: t('department.name'),
      required: true,
      placeholder: '请输入部门名称',
    },
    {
      name: 'code',
      label: t('department.code'),
      placeholder: '请输入部门编码',
    },
    {
      name: 'leader',
      label: t('department.leader'),
      placeholder: '请输入负责人',
    },
    {
      name: 'sort',
      label: '排序',
      type: 'number',
    },
    {
      name: 'status',
      label: t('common.status'),
      type: 'custom',
      render: (value, onChange) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value === 1}
            onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
          />
          <span className="text-sm text-muted-foreground">
            {value === 1 ? t('common.enabled') : t('common.disabled')}
          </span>
        </div>
      ),
    },
  ];

  return (
    <CrudPage
      title={t('menu.department')}
      columns={columns}
      formFields={formFields}
      data={tree}
      loading={loading}
      treeMode
      defaultExpandAll
      onAdd={async (data) => {
        await dispatch(createDepartment({ ...data, status: data.status ?? 1 })).unwrap();
      }}
      onEdit={async (id, data) => {
        await dispatch(updateDepartment({ id, data })).unwrap();
      }}
      onDelete={async (id) => {
        await dispatch(deleteDepartment(id)).unwrap();
      }}
      onRefresh={() => {
        dispatch(fetchDepartments());
      }}
      addButtonText={t('common.add')}
      editTitle="编辑部门"
      addTitle="新增部门"
      deleteConfirmTitle={t('common.confirm')}
      deleteConfirmDescription="确定删除该部门吗？此操作无法撤销。"
    />
  );
}
