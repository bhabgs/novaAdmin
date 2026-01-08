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
import { toast } from 'sonner';
import request from '@/utils/request';

interface I18nItem {
  id: string;
  key: string;
  zhCN: string;
  enUS: string;
  arSA: string;
  module: string;
}

const defaultForm = { key: '', zhCN: '', enUS: '', arSA: '', module: '' };

export default function I18nPage() {
  const { t } = useTranslation();
  const [list, setList] = useState<I18nItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await request.get<I18nItem[]>('/system/i18n');
      setList(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = Array.isArray(list)
    ? list.filter(
        (item) =>
          item.key.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.zhCN?.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.enUS?.toLowerCase().includes(searchKey.toLowerCase())
      )
    : [];

  const handleAdd = () => {
    setEditId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleEdit = (item: I18nItem) => {
    setEditId(item.id);
    setForm({
      key: item.key,
      zhCN: item.zhCN || '',
      enUS: item.enUS || '',
      arSA: item.arSA || '',
      module: item.module || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key) {
      toast.error('Key 不能为空');
      return;
    }
    try {
      await request.post('/system/i18n', form);
      toast.success(editId ? '更新成功' : '添加成功');
      setDialogOpen(false);
      fetchList();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await request.delete(`/system/i18n/${deleteId}`);
      toast.success('删除成功');
      setDeleteId(null);
      fetchList();
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.i18n')}</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="pl-8 w-64"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>中文</TableHead>
              <TableHead>English</TableHead>
              <TableHead>العربية</TableHead>
              <TableHead>{t('i18n.module')}</TableHead>
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
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.key}</TableCell>
                  <TableCell>{item.zhCN || '-'}</TableCell>
                  <TableCell>{item.enUS || '-'}</TableCell>
                  <TableCell dir="rtl">{item.arSA || '-'}</TableCell>
                  <TableCell>{item.module || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? t('common.edit') : t('common.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Key *</Label>
                <Input
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  disabled={!!editId}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('i18n.module')}</Label>
                <Input
                  value={form.module}
                  onChange={(e) => setForm({ ...form, module: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>中文</Label>
              <Input
                value={form.zhCN}
                onChange={(e) => setForm({ ...form, zhCN: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>English</Label>
              <Input
                value={form.enUS}
                onChange={(e) => setForm({ ...form, enUS: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>العربية</Label>
              <Input
                dir="rtl"
                value={form.arSA}
                onChange={(e) => setForm({ ...form, arSA: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>确定删除该国际化配置吗？</AlertDialogDescription>
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
