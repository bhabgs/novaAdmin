import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchMenus, deleteMenu, createMenu, updateMenu } from '@/store/slices/menuSlice';
import { MoreHorizontal, Pencil, Trash2, Plus, ChevronRight, ChevronDown, Folder, FileText, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  nameI18n?: string;
  type: number;
  parentId?: string;
  icon?: string;
  path: string;
  component: string;
  permission: string;
  sort: number;
  status: number;
  visible: boolean;
  keepAlive: boolean;
  description: string;
  remark: string;
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
            <span className="ml-2 font-medium">
              {node.nameI18n ? t(node.nameI18n) : node.name}
            </span>
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
    nameI18n: '',
    path: '',
    component: '',
    type: 2,
    permission: '',
    sort: 0,
    status: 1,
    visible: true,
    keepAlive: false,
    description: '',
    remark: '',
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
      nameI18n: '',
      path: '',
      component: '',
      type: 2,
      permission: '',
      sort: 0,
      status: 1,
      visible: true,
      keepAlive: false,
      description: '',
      remark: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (menu: any) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      nameI18n: menu.nameI18n || '',
      path: menu.path || '',
      component: menu.component || '',
      type: menu.type,
      permission: menu.permission || '',
      parentId: menu.parentId,
      icon: menu.icon,
      sort: menu.sort || 0,
      status: menu.status,
      visible: menu.visible !== false,
      keepAlive: menu.keepAlive || false,
      description: menu.description || '',
      remark: menu.remark || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      sort: formData.sort,
      visible: formData.visible,
    };
    if (formData.nameI18n) submitData.nameI18n = formData.nameI18n;
    if (formData.path) submitData.path = formData.path;
    if (formData.component) submitData.component = formData.component;
    if (formData.permission) submitData.permission = formData.permission;
    if (formData.parentId) submitData.parentId = formData.parentId;
    if (formData.icon) submitData.icon = formData.icon;
    if (formData.keepAlive) submitData.keepAlive = formData.keepAlive;
    if (formData.description) submitData.description = formData.description;
    if (formData.remark) submitData.remark = formData.remark;

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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingMenu ? '编辑菜单' : '新增菜单'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Row 1: 菜单名称 | 国际化Key */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center">
                    <span className="text-destructive mr-1">*</span>菜单名称
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入菜单名称"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nameI18n">国际化Key</Label>
                  <Input
                    id="nameI18n"
                    value={formData.nameI18n}
                    onChange={(e) => setFormData({ ...formData, nameI18n: e.target.value })}
                    placeholder="如：menu.user (选填，优先使用)"
                  />
                  <p className="text-xs text-muted-foreground">
                    填写后菜单名称将从国际化配置读取
                  </p>
                </div>
              </div>

              {/* Row 2: 菜单类型 */}
              <div className="grid gap-2">
                <Label htmlFor="type" className="flex items-center">
                  <span className="text-destructive mr-1">*</span>菜单类型
                </Label>
                <Select
                  value={formData.type.toString()}
                  onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />目录
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />页面
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />按钮
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 3: 父级菜单 | 菜单图标 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="parentId">父级菜单</Label>
                  <Select
                    value={formData.parentId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择父级菜单" />
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
                  <Label htmlFor="icon">菜单图标</Label>
                  <Select
                    value={formData.icon || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, icon: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择菜单图标" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      <SelectItem value="folder">Folder</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: 菜单路径 | 组件路径 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="path" className="flex items-center">
                    <span className="text-destructive mr-1">*</span>菜单路径
                  </Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    placeholder="页面路径，如 /user/list"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="component" className="flex items-center">
                    <span className="text-destructive mr-1">*</span>组件路径
                  </Label>
                  <Input
                    id="component"
                    value={formData.component}
                    onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                    placeholder="请输入组件路径，如 pages/User/UserList"
                  />
                </div>
              </div>

              {/* Row 5: 权限标识 | 排序 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="permission" className="flex items-center">
                    <span className="text-destructive mr-1">*</span>权限标识
                  </Label>
                  <Input
                    id="permission"
                    value={formData.permission}
                    onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                    placeholder="请输入权限标识"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sort">排序</Label>
                  <Input
                    id="sort"
                    type="number"
                    value={formData.sort}
                    onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Row 6: 状态 | 隐藏菜单 | 缓存页面 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>状态</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.status === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 0 })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.status === 1 ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>隐藏菜单</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!formData.visible}
                      onCheckedChange={(checked) => setFormData({ ...formData, visible: !checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.visible ? '否' : '是'}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>缓存页面</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.keepAlive}
                      onCheckedChange={(checked) => setFormData({ ...formData, keepAlive: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.keepAlive ? '是' : '否'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 7: 描述 */}
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 200) })}
                  placeholder="请输入描述信息"
                  rows={3}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.description.length} / 200
                </div>
              </div>

              {/* Row 8: 备注 */}
              <div className="grid gap-2">
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value.slice(0, 100) })}
                  placeholder="请输入备注信息"
                  rows={2}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.remark.length} / 100
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
