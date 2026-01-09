import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMenus, deleteMenu, createMenu, updateMenu } from '@/store/slices/menuSlice';
import { Folder, FileText, MousePointer } from 'lucide-react';
import { iconMap } from '@/config/icons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/data-table';
import { CrudDialog, DeleteDialog, FormField } from '@/components/crud-dialog';
import { PageContainer } from '@/components/page-container';
import { IconPicker } from '@/components/icon-picker';
import { i18nControllerFindAll } from '@/api/services.gen';

interface I18nItem {
  id: string;
  key: string;
  zhCN: string;
  module: string;
}

const menuTypeIcons: Record<number, React.ReactNode> = {
  1: <Folder className="h-4 w-4 text-yellow-500" />,
  2: <FileText className="h-4 w-4 text-blue-500" />,
  3: <MousePointer className="h-4 w-4 text-green-500" />,
};

const menuTypeLabels: Record<number, string> = {
  1: '目录',
  2: '菜单',
  3: '按钮',
};

export default function MenuList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tree, loading } = useAppSelector((state) => state.menu);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [i18nList, setI18nList] = useState<I18nItem[]>([]);

  // 获取 i18n 列表（只获取 menu 模块的）
  const fetchI18nList = async () => {
    try {
      const res = await i18nControllerFindAll({ query: {} });
      const items = res.data?.data || res.data;
      if (Array.isArray(items)) {
        // 过滤出 menu 模块的国际化配置
        setI18nList(items.filter((item: I18nItem) => item.module === 'menu'));
      }
    } catch (error) {
      console.error('Failed to fetch i18n list:', error);
    }
  };

  const parentMenuOptions = useMemo(() => {
    const findDirectories = (menus: any[]): any[] => {
      const result: any[] = [];
      menus.forEach((m) => {
        if (m.type === 1 && m.status === 1) {
          result.push(m);
        }
        if (m.children?.length > 0) {
          result.push(...findDirectories(m.children));
        }
      });
      return result;
    };
    return findDirectories(tree);
  }, [tree]);

  useEffect(() => {
    dispatch(fetchMenus());
    fetchI18nList();
  }, [dispatch]);

  const columns: Column[] = [
    {
      key: 'name',
      title: '菜单名称',
      render: (_, record) => {
        // 优先使用菜单配置的图标，否则使用类型默认图标
        const MenuIcon = record.icon && iconMap[record.icon] ? iconMap[record.icon] : null;
        return (
          <div className="flex items-center gap-2">
            {MenuIcon ? <MenuIcon className="h-4 w-4 text-primary" /> : menuTypeIcons[record.type]}
            <span>{record.nameI18n ? t(record.nameI18n) : record.name}</span>
          </div>
        );
      },
    },
    { key: 'path', title: '路径' },
    {
      key: 'type',
      title: '类型',
      render: (value) => <Badge variant="outline">{menuTypeLabels[value]}</Badge>,
    },
    { key: 'permission', title: '权限标识', render: (v) => <span className="font-mono text-xs">{v || '-'}</span> },
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
    { name: 'name', label: '菜单名称', required: true, placeholder: '请输入菜单名称' },
    {
      name: 'nameI18n',
      label: '国际化Key',
      type: 'custom',
      render: (value, onChange) => (
        <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="选择国际化Key" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无</SelectItem>
            {i18nList.map((item) => (
              <SelectItem key={item.id} value={`menu.${item.key}`}>
                {item.key} - {item.zhCN}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      name: 'icon',
      label: '菜单图标',
      type: 'custom',
      render: (value, onChange) => (
        <IconPicker value={value} onChange={onChange} placeholder="选择图标" />
      ),
    },
    {
      name: 'type',
      label: '菜单类型',
      required: true,
      type: 'custom',
      render: (value, onChange) => (
        <Select value={String(value || 2)} onValueChange={(v) => onChange(parseInt(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1"><div className="flex items-center gap-2"><Folder className="h-4 w-4" />目录</div></SelectItem>
            <SelectItem value="2"><div className="flex items-center gap-2"><FileText className="h-4 w-4" />页面</div></SelectItem>
            <SelectItem value="3"><div className="flex items-center gap-2"><MousePointer className="h-4 w-4" />按钮</div></SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      name: 'parentId',
      label: '父级菜单',
      type: 'custom',
      render: (value, onChange) => (
        <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="请选择父级菜单" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无（顶级菜单）</SelectItem>
            {parentMenuOptions.map((menu: any) => (
              <SelectItem key={menu.id} value={menu.id}>{menu.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { name: 'path', label: '菜单路径', placeholder: '页面路径，如 /user/list' },
    { name: 'component', label: '组件路径', placeholder: '如 pages/User/UserList' },
    { name: 'permission', label: '权限标识', placeholder: '请输入权限标识' },
    { name: 'sort', label: '排序', type: 'number' },
    {
      name: 'status',
      label: '状态',
      type: 'custom',
      render: (value, onChange) => (
        <div className="flex items-center gap-2">
          <Switch checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} />
          <span className="text-sm text-muted-foreground">{value === 1 ? '启用' : '禁用'}</span>
        </div>
      ),
    },
    {
      name: 'visible',
      label: '显示菜单',
      type: 'custom',
      render: (value, onChange) => (
        <div className="flex items-center gap-2">
          <Switch checked={value !== false} onCheckedChange={(checked) => onChange(checked)} />
          <span className="text-sm text-muted-foreground">{value !== false ? '显示' : '隐藏'}</span>
        </div>
      ),
    },
    { name: 'description', label: '描述', type: 'textarea', rows: 2, colSpan: 2 },
  ];

  const handleAdd = () => {
    setEditingMenu(null);
    setDialogOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingMenu(record);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: any, isEdit: boolean) => {
    const submitData: any = {
      name: formData.name,
      type: formData.type || 2,
      status: formData.status ?? 1,
      sort: formData.sort || 0,
      visible: formData.visible !== false,
    };
    if (formData.nameI18n) submitData.nameI18n = formData.nameI18n;
    if (formData.icon) submitData.icon = formData.icon;
    if (formData.path) submitData.path = formData.path;
    if (formData.component) submitData.component = formData.component;
    if (formData.permission) submitData.permission = formData.permission;
    if (formData.parentId) submitData.parentId = formData.parentId;
    if (formData.description) submitData.description = formData.description;

    try {
      if (isEdit && editingMenu) {
        await dispatch(updateMenu({ id: editingMenu.id, data: submitData })).unwrap();
        toast.success('更新成功');
      } else {
        await dispatch(createMenu(submitData)).unwrap();
        toast.success('创建成功');
      }
      dispatch(fetchMenus());
    } catch (error) {
      toast.error(isEdit ? '更新失败' : '创建失败');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteMenu(deleteId)).unwrap();
        toast.success('删除成功');
        dispatch(fetchMenus());
      } catch (error) {
        toast.error('删除失败');
        throw error;
      }
    }
  };

  const getInitialData = (record?: any) => ({
    name: record?.name || '',
    nameI18n: record?.nameI18n || '',
    icon: record?.icon || '',
    type: record?.type || 2,
    parentId: record?.parentId || undefined,
    path: record?.path || '',
    component: record?.component || '',
    permission: record?.permission || '',
    sort: record?.sort || 0,
    status: record?.status ?? 1,
    visible: record?.visible !== false,
    description: record?.description || '',
  });

  return (
    <PageContainer title={t('menu.menu')} onAdd={handleAdd} addButtonText={t('common.add')}>
      <DataTable
        columns={columns}
        data={tree}
        loading={loading}
        treeMode
        defaultExpandAll
        onEdit={handleEdit}
        onDelete={(record) => setDeleteId(record.id)}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formFields={formFields}
        editingRecord={editingMenu}
        onSubmit={handleSubmit}
        editTitle="编辑菜单"
        addTitle="新增菜单"
        getInitialData={getInitialData}
        columns={2}
      />

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        description="确定删除该菜单吗？此操作无法撤销。"
      />
    </PageContainer>
  );
}
