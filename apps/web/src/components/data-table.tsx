import { ReactNode, useState } from 'react';
import { ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
  width?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  getRowKey?: (record: T) => string;
  treeMode?: boolean;
  childrenKey?: string;
  defaultExpandAll?: boolean;
  renderRow?: (record: T, defaultRow: ReactNode) => ReactNode;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  canEdit?: (record: T) => boolean;
  canDelete?: (record: T) => boolean;
  renderActions?: (record: T) => ReactNode;
  extraRowActions?: (record: T) => ReactNode;
  emptyText?: string;
  loadingText?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  getRowKey = (record) => record.id,
  treeMode = false,
  childrenKey = 'children',
  defaultExpandAll = false,
  renderRow,
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
  renderActions,
  extraRowActions,
  emptyText = '暂无数据',
  loadingText = '加载中...',
}: DataTableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    if (treeMode && defaultExpandAll) {
      const keys = new Set<string>();
      const collectKeys = (items: T[]) => {
        items.forEach((item) => {
          const children = item[childrenKey];
          if (children && Array.isArray(children) && children.length > 0) {
            keys.add(getRowKey(item));
            collectKeys(children);
          }
        });
      };
      collectKeys(data);
      return keys;
    }
    return new Set();
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const hasActions = onEdit || onDelete || renderActions || extraRowActions;

  const renderTreeRows = (items: T[], level = 0): ReactNode[] => {
    const rows: ReactNode[] = [];

    items.forEach((record) => {
      const rowKey = getRowKey(record);
      const children = record[childrenKey];
      const hasChildren = children && Array.isArray(children) && children.length > 0;
      const isExpanded = expandedKeys.has(rowKey);

      const defaultRowElement = (
        <TableRow key={rowKey}>
          {columns.map((col, idx) => (
            <TableCell key={col.key}>
              {idx === 0 && treeMode && (
                <span style={{ paddingLeft: `${level * 20}px` }} className="inline-flex items-center">
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(rowKey)}
                      className="mr-1 hover:bg-accent rounded p-0.5"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? '收起' : '展开'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  )}
                  {!hasChildren && <span className="w-5 inline-block" />}
                  {col.render ? col.render(record[col.key], record) : record[col.key] || '-'}
                </span>
              )}
              {(idx !== 0 || !treeMode) && (
                col.render ? col.render(record[col.key], record) : record[col.key] || '-'
              )}
            </TableCell>
          ))}
          {hasActions && (
            <TableCell className="text-right">
              {renderActions ? (
                renderActions(record)
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="操作菜单">
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {extraRowActions && extraRowActions(record)}
                    {onEdit && canEdit(record) && (
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                        编辑
                      </DropdownMenuItem>
                    )}
                    {onDelete && canDelete(record) && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(record)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        删除
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          )}
        </TableRow>
      );

      rows.push(renderRow ? renderRow(record, defaultRowElement) : defaultRowElement);

      if (hasChildren && isExpanded) {
        rows.push(...renderTreeRows(children, level + 1));
      }
    });

    return rows;
  };

  const renderFlatRows = () => {
    return data.map((record) => {
      const defaultRowElement = (
        <TableRow key={getRowKey(record)}>
          {columns.map((col) => (
            <TableCell key={col.key}>
              {col.render ? col.render(record[col.key], record) : record[col.key] || '-'}
            </TableCell>
          ))}
          {hasActions && (
            <TableCell className="text-right">
              {renderActions ? (
                renderActions(record)
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="操作菜单">
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {extraRowActions && extraRowActions(record)}
                    {onEdit && canEdit(record) && (
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                        编辑
                      </DropdownMenuItem>
                    )}
                    {onDelete && canDelete(record) && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(record)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        删除
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          )}
        </TableRow>
      );
      return renderRow ? renderRow(record, defaultRowElement) : defaultRowElement;
    });
  };

  return (
    <div className="rounded-md border" role="region" aria-label="数据表格">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} style={{ width: col.width }} scope="col">
                {col.title}
              </TableHead>
            ))}
            {hasActions && <TableHead className="text-right" scope="col">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="text-center h-32"
                aria-live="polite"
                aria-busy="true"
              >
                {loadingText}
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="text-center h-32 text-muted-foreground"
                aria-live="polite"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : treeMode ? (
            renderTreeRows(data)
          ) : (
            renderFlatRows()
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">总计: {pagination.total}</span>
        </div>
      )}
    </div>
  );
}
