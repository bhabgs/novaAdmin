import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  i18nControllerFindAll,
  i18nControllerSet,
  i18nControllerRemove,
  dictControllerFindItemsByTypeCode,
} from '@/api/services.gen';

interface I18nItem {
  id: string;
  key: string;
  zhCN: string;
  enUS: string;
  arSA: string;
  module: string;
}

interface DictItem {
  id: string;
  label: string;
  value: string;
}

const defaultForm = { key: '', zhCN: '', enUS: '', arSA: '', module: '' };

export default function I18nPage() {
  const { t } = useTranslation();
  const [list, setList] = useState<I18nItem[]>([]);
  const [modules, setModules] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [translating, setTranslating] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await i18nControllerFindAll({ query: {} });
      const items = res.data?.data || res.data;
      setList(Array.isArray(items) ? items : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await dictControllerFindItemsByTypeCode({
        query: { dictTypeCode: 'i18n' },
      });
      const dictItems = res.data?.data || res.data;
      if (Array.isArray(dictItems)) {
        setModules(dictItems);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  useEffect(() => {
    fetchList();
    fetchModules();
  }, []);

  const filteredList = Array.isArray(list)
    ? list.filter((item) => {
        // 搜索筛选
        const matchSearch =
          !searchKey ||
          item.key.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.zhCN?.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.enUS?.toLowerCase().includes(searchKey.toLowerCase());

        // 模块筛选
        const matchModule = moduleFilter === 'all' || item.module === moduleFilter;

        return matchSearch && matchModule;
      })
    : [];

  // 根据 value 查找对应的 label（中文名称）
  const getModuleLabel = (value: string) => {
    const module = modules.find((m) => m.value === value);
    return module?.label || value;
  };

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
      await i18nControllerSet({ body: form });
      toast.success(editId ? '更新成功' : '添加成功');
      setDialogOpen(false);
      fetchList();
      fetchModules(); // 重新获取模块列表，以便新模块出现在选项中
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await i18nControllerRemove({ path: { id: deleteId } });
      toast.success('删除成功');
      setDeleteId(null);
      fetchList();
    } catch {
      toast.error('删除失败');
    }
  };

  // 使用 MyMemory API 进行翻译
  const translateText = async (text: string, targetLang: 'en' | 'ar') => {
    if (!text.trim()) return '';
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`
      );
      const data = await response.json();
      return data.responseData?.translatedText || '';
    } catch (error) {
      console.error(`Translation to ${targetLang} failed:`, error);
      return '';
    }
  };

  const handleAutoTranslate = async () => {
    if (!form.zhCN) {
      toast.error('请先输入中文内容');
      return;
    }
    setTranslating(true);
    try {
      const [enText, arText] = await Promise.all([
        translateText(form.zhCN, 'en'),
        translateText(form.zhCN, 'ar'),
      ]);
      setForm({ ...form, enUS: enText, arSA: arText });
      toast.success('翻译完成');
    } catch (error) {
      toast.error('翻译失败');
    } finally {
      setTranslating(false);
    }
  };

  const handleCopyKey = async (key: string, module?: string) => {
    try {
      const fullKey = module ? `${module}.${key}` : key;
      await navigator.clipboard.writeText(fullKey);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.i18n')}</h1>
        <div className="flex gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="选择模块" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部模块</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.value}>
                  {module.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span>{item.key}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyKey(item.key, item.module)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{item.zhCN || '-'}</TableCell>
                  <TableCell>{item.enUS || '-'}</TableCell>
                  <TableCell dir="rtl">{item.arSA || '-'}</TableCell>
                  <TableCell>{item.module ? getModuleLabel(item.module) : '-'}</TableCell>
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
                <Select
                  value={form.module}
                  onValueChange={(value) => setForm({ ...form, module: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择模块" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>中文</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoTranslate}
                  disabled={translating || !form.zhCN}
                  className="h-7 text-xs"
                >
                  {translating ? '翻译中...' : '自动翻译'}
                </Button>
              </div>
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
