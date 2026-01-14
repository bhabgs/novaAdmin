import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  dictControllerFindAllTypes,
  dictControllerCreateType,
  dictControllerUpdateType,
  dictControllerRemoveType,
  dictControllerFindItemsByTypeCode,
  dictControllerCreateItem,
  dictControllerUpdateItem,
  dictControllerRemoveItem,
} from '@/api/services.gen';

interface DictType {
  id: string;
  name: string;
  code: string;
  description: string;
  status: number;
  sort: number;
}

interface DictItem {
  id: string;
  dictTypeCode: string;
  label: string;
  value: string;
  description: string;
  status: number;
  sort: number;
}

const defaultTypeForm = { name: '', code: '', description: '', status: 1, sort: 0 };
const defaultItemForm = {
  dictTypeCode: '',
  label: '',
  value: '',
  description: '',
  status: 1,
  sort: 0,
};

export default function DictPage() {
  const { t } = useTranslation();

  // 字典类型相关状态
  const [types, setTypes] = useState<DictType[]>([]);
  const [selectedType, setSelectedType] = useState<DictType | null>(null);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeForm, setTypeForm] = useState(defaultTypeForm);
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);

  // 字典项相关状态
  const [items, setItems] = useState<DictItem[]>([]);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState(defaultItemForm);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [itemSearchKey, setItemSearchKey] = useState('');

  const [loading, setLoading] = useState(false);

  // 获取字典类型列表
  const fetchTypes = async () => {
    setLoading(true);
    try {
      const response = await dictControllerFindAllTypes();
      const data = response.data?.data || response.data;
      setTypes(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedType) {
        setSelectedType(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取字典项列表
  const fetchItems = async (typeCode: string) => {
    try {
      const response = await dictControllerFindItemsByTypeCode({
        query: { dictTypeCode: typeCode },
      });
      const data = response.data?.data || response.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchItems(selectedType.code);
    }
  }, [selectedType]);

  // ========== 字典类型操作 ==========
  const handleAddType = () => {
    setEditTypeId(null);
    setTypeForm(defaultTypeForm);
    setTypeDialogOpen(true);
  };

  const handleEditType = (type: DictType) => {
    setEditTypeId(type.id);
    setTypeForm({
      name: type.name,
      code: type.code,
      description: type.description || '',
      status: type.status,
      sort: type.sort,
    });
    setTypeDialogOpen(true);
  };

  const handleSaveType = async () => {
    if (!typeForm.name || !typeForm.code) {
      toast.error('名称和编码不能为空');
      return;
    }
    try {
      if (editTypeId) {
        await dictControllerUpdateType({ path: { id: editTypeId }, body: typeForm });
        toast.success('更新成功');
      } else {
        await dictControllerCreateType({ body: typeForm });
        toast.success('添加成功');
      }
      setTypeDialogOpen(false);
      fetchTypes();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTypeId) return;
    try {
      await dictControllerRemoveType({ path: { id: deleteTypeId } });
      toast.success('删除成功');
      setDeleteTypeId(null);
      if (selectedType?.id === deleteTypeId) {
        setSelectedType(null);
        setItems([]);
      }
      fetchTypes();
    } catch {
      toast.error('删除失败');
    }
  };

  // ========== 字典项操作 ==========
  const handleAddItem = () => {
    if (!selectedType) {
      toast.error('请先选择字典类型');
      return;
    }
    setEditItemId(null);
    setItemForm({ ...defaultItemForm, dictTypeCode: selectedType.code });
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: DictItem) => {
    setEditItemId(item.id);
    setItemForm({
      dictTypeCode: item.dictTypeCode,
      label: item.label,
      value: item.value,
      description: item.description || '',
      status: item.status,
      sort: item.sort,
    });
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.label || !itemForm.value) {
      toast.error('标签和值不能为空');
      return;
    }
    try {
      if (editItemId) {
        await dictControllerUpdateItem({ path: { id: editItemId }, body: itemForm });
        toast.success('更新成功');
      } else {
        await dictControllerCreateItem({ body: itemForm });
        toast.success('添加成功');
      }
      setItemDialogOpen(false);
      if (selectedType) {
        fetchItems(selectedType.code);
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await dictControllerRemoveItem({ path: { id: deleteItemId } });
      toast.success('删除成功');
      setDeleteItemId(null);
      if (selectedType) {
        fetchItems(selectedType.code);
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const filteredItems = items.filter(
    (item) =>
      !itemSearchKey ||
      item.label.toLowerCase().includes(itemSearchKey.toLowerCase()) ||
      item.value.toLowerCase().includes(itemSearchKey.toLowerCase()),
  );

  return (
    <div className="flex gap-4 h-full">
      {/* 左侧：字典类型列表 */}
      <div className="w-80 flex flex-col border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">字典类型</h2>
          <Button size="sm" onClick={handleAddType}>
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>
        <div className="flex-1 overflow-auto space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">加载中...</div>
          ) : types.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">暂无数据</div>
          ) : (
            types.map((type) => (
              <div
                key={type.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                  selectedType?.id === type.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedType(type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground">{type.code}</div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditType(type)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteTypeId(type.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧：字典项列表 */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {selectedType ? `${selectedType.name} - 字典项` : '字典项'}
          </h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标签或值"
                className="pl-8 w-64"
                value={itemSearchKey}
                onChange={(e) => setItemSearchKey(e.target.value)}
              />
            </div>
            <Button onClick={handleAddItem} disabled={!selectedType}>
              <Plus className="h-4 w-4" />
              新增
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标签</TableHead>
                <TableHead>值</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedType ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    请先选择字典类型
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="font-mono text-sm">{item.value}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{item.status === 1 ? '启用' : '禁用'}</TableCell>
                    <TableCell>{item.sort}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 字典类型对话框 */}
      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTypeId ? '编辑字典类型' : '新增字典类型'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>类型名称 *</Label>
              <Input
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="请输入类型名称"
              />
            </div>
            <div className="space-y-2">
              <Label>类型编码 *</Label>
              <Input
                value={typeForm.code}
                onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                placeholder="请输入类型编码（英文）"
                disabled={!!editTypeId}
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={typeForm.description}
                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                placeholder="请输入描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={String(typeForm.status)}
                  onValueChange={(value) =>
                    setTypeForm({ ...typeForm, status: Number(value) })
                  }
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
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={typeForm.sort}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, sort: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTypeDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveType}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 字典项对话框 */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItemId ? '编辑字典项' : '新增字典项'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标签 *</Label>
              <Input
                value={itemForm.label}
                onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                placeholder="请输入标签"
              />
            </div>
            <div className="space-y-2">
              <Label>值 *</Label>
              <Input
                value={itemForm.value}
                onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                placeholder="请输入值"
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="请输入描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={String(itemForm.status)}
                  onValueChange={(value) =>
                    setItemForm({ ...itemForm, status: Number(value) })
                  }
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
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={itemForm.sort}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, sort: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveItem}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除字典类型确认对话框 */}
      <AlertDialog open={deleteTypeId !== null} onOpenChange={() => setDeleteTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除该字典类型吗？删除后，该类型下的所有字典项也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteType}>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除字典项确认对话框 */}
      <AlertDialog open={deleteItemId !== null} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定删除该字典项吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
