import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMenus, deleteMenu, createMenu, updateMenu } from '@/store/slices/menuSlice';
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronRight, ChevronDown, Folder, FileText, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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

interface MenuFormData {
  name: string;
  path: string;
  component: string;
  type: number;
  permission: string;
  parentId?: string;
  status: number;
}

function TreeNode({
  node,
  level = 0,
  onEdit,
  onDelete
}: {
  node: any;
  level?: number;
  onEdit: (node: any) => void;
  onDelete: (id: string) => void;
}) {
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
            {menuTypeIcons[node.type]}
            <span className="ml-2 font-medium">{node.name}</span>
          </div>
        </TableCell>
        <TableCell>{node.path || '-'}</TableCell>
        <TableCell>
          <Badge variant="outline">{menuTypeLabels[node.type]}</Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">{node.permission || '-'}</TableCell>
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
              <DropdownMenuItem onClick={() => onEdit(node)}>
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
        <TreeNode key={child.id} node={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function MenuList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tree, loading } = useAppSelector((state) => state.menu);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    path: '',
    type: 2,
    permission: '',
    status: 1,
  });

  // 获取可作为父级的菜单（只有目录类型可以作为父级）
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
  }, [dispatch]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteMenu(deleteId)).unwrap();
        toast.success('删除成功');
        dispatch(fetchMenus());
      } catch (error) {
        toast.error('删除失败');
      }
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      path: '',
      component: '',
      type: 2,
      permission: '',
      status: 1,
    });
    setDialogOpen(true);
  };

  const handleEdit = (menu: any) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      path: menu.path || '',
      component: menu.component || '',
      type: menu.type,
      permission: menu.permission || '',
      parentId: menu.parentId,
      status: menu.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 过滤掉空字符串字段
    const submitData: any = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
    };
    if (formData.path) submitData.path = formData.path;
    if (formData.component) submitData.component = formData.component;
    if (formData.permission) submitData.permission = formData.permission;
    if (formData.parentId) submitData.parentId = formData.parentId;

    try {
      if (editingMenu) {
        await dispatch(updateMenu({ id: editingMenu.id, data: submitData })).unwrap();
        toast.success('更新成功');
      } else {
        await dispatch(createMenu(submitData)).unwrap();
        toast.success('创建成功');
      }
      setDialogOpen(false);
      dispatch(fetchMenus());
    } catch (error) {
      toast.error(editingMenu ? '更新失败' : '创建失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.menu')}</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>菜单名称</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>权限标识</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : tree.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              tree.map((node: any) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除该菜单吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMenu ? '编辑菜单' : '新增菜单'}</DialogTitle>
            <DialogDescription>
              {editingMenu ? '修改菜单信息' : '填写菜单信息'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="parentId">父级菜单</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级菜单" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶级菜单）</SelectItem>
                    {parentMenuOptions.map((menu: any) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">菜单名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">菜单类型</Label>
                <Select
                  value={formData.type.toString()}
                  onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">目录</SelectItem>
                    <SelectItem value="2">菜单</SelectItem>
                    <SelectItem value="3">按钮</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="path">路径</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/example"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="component">组件路径</Label>
                <Input
                  id="component"
                  value={formData.component}
                  onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                  placeholder="system/setting/index"
                />
                <p className="text-xs text-muted-foreground">
                  相对于 pages 目录的路径，例如: system/setting/index
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permission">权限标识</Label>
                <Input
                  id="permission"
                  value={formData.permission}
                  onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                  placeholder="system:menu:list"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingMenu ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
