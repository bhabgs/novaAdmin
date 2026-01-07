import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDepartments, deleteDepartment } from '@/store/slices/departmentSlice';
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function TreeNode({ node, level = 0, onDelete }: { node: any; level?: number; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <tr className="border-b last:border-0">
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="p-1 mr-1">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            {node.name}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{node.code || '-'}</td>
        <td className="px-4 py-3 text-sm">{node.leader || '-'}</td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs ${
              node.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {node.status === 1 ? t('common.enabled') : t('common.disabled')}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-accent rounded">
              <Pencil className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-accent rounded text-destructive" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && node.children.map((child: any) => (
        <TreeNode key={child.id} node={child} level={level + 1} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function DepartmentList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { tree, loading } = useAppSelector((state) => state.department);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('确定删除该部门吗？')) {
      dispatch(deleteDepartment(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('menu.department')}</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">{t('department.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('department.code')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('department.leader')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('common.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : tree.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              tree.map((node: any) => <TreeNode key={node.id} node={node} onDelete={handleDelete} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
