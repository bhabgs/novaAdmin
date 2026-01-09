import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Copy } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  i18nControllerFindAll,
  i18nControllerSet,
  i18nControllerRemove,
  dictControllerFindItemsByTypeCode,
} from '@/api/services.gen';
import { DataTable, Column } from '@/components/data-table';
import { DeleteDialog } from '@/components/crud-dialog';
import { PageContainer } from '@/components/page-container';

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
        const matchSearch =
          !searchKey ||
          item.key.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.zhCN?.toLowerCase().includes(searchKey.toLowerCase()) ||
          item.enUS?.toLowerCase().includes(searchKey.toLowerCase());
        const matchModule = moduleFilter === 'all' || item.module === moduleFilter;
        return matchSearch && matchModule;
      })
    : [];

  const getModuleLabel = (value: string) => {
    const module = modules.find((m) => m.value === value);
    return module?.label || value;
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

  const columns: Column<I18nItem>[] = [
    {
      key: 'key',
      title: 'Key',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{value}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyKey(record.key, record.module);
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    { key: 'zhCN', title: '中文' },
    { key: 'enUS', title: 'English' },
    { key: 'arSA', title: 'العربية', render: (v) => <span dir="rtl">{v || '-'}</span> },
    { key: 'module', title: t('i18n.module'), render: (v) => (v ? getModuleLabel(v) : '-') },
  ];

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

  const handleAdd = () => {
    setEditId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleEdit = (record: I18nItem) => {
    setEditId(record.id);
    setForm({
      key: record.key,
      zhCN: record.zhCN || '',
      enUS: record.enUS || '',
      arSA: record.arSA || '',
      module: record.module || '',
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
      fetchModules();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await i18nControllerRemove({ path: { id: deleteId } });
      toast.success('删除成功');
      fetchList();
    } catch {
      toast.error('删除失败');
      throw new Error('Delete failed');
    }
  };

  const toolbarExtra = (
    <>
      <Select value={moduleFilter} onValueChange={setModuleFilter}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="选择模块" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部模块</SelectItem>
          {modules.map((module) => (
            <SelectItem key={module.id} value={module.value}>{module.label}</SelectItem>
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
    </>
  );

  return (
    <PageContainer
      title={t('menu.i18n')}
      onAdd={handleAdd}
      addButtonText={t('common.add')}
      toolbarExtra={toolbarExtra}
    >
      <DataTable
        columns={columns}
        data={filteredList}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(record) => setDeleteId(record.id)}
      />

      {/* 自定义弹窗，支持自动翻译 */}
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

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('common.confirm')}
        description="确定删除该国际化配置吗？"
      />
    </PageContainer>
  );
}
