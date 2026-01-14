import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, RotateCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { removeTab, setActiveTab, refreshTab, removeOtherTabs, removeRightTabs, removeLeftTabs, clearTabs, TabItem } from '@/store/slices/tabsSlice';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export function TabsNav() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tabs, activeKey } = useAppSelector((state) => state.tabs);

  // 当语言变化时，重新计算标签显示名称
  const translatedTabs = useMemo(() => {
    return tabs.map((tab) => {
      let displayLabel = tab.label;
      if (tab.nameI18n) {
        const translated = t(tab.nameI18n);
        if (translated && translated !== tab.nameI18n) {
          displayLabel = translated;
        }
      }
      return { ...tab, displayLabel };
    });
  }, [tabs, t, i18n.language]); // 显式依赖 i18n.language 确保语言切换时更新

  const handleTabClick = (key: string, path: string) => {
    dispatch(setActiveTab(key));
    navigate(path);
  };

  const handleTabClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    const tab = tabs.find((t) => t.key === key);
    if (tab?.closable === false) return;

    dispatch(removeTab(key));
    const remaining = tabs.filter((t) => t.key !== key);
    if (activeKey === key && remaining.length > 0) {
      const idx = tabs.findIndex((t) => t.key === key);
      const nextTab = remaining[Math.max(0, idx - 1)];
      navigate(nextTab.path);
    }
  };

  const handleRefresh = (key: string, path: string) => {
    if (key !== activeKey) {
      dispatch(setActiveTab(key));
      navigate(path);
    }
    dispatch(refreshTab());
  };

  const handleCloseOthers = (key: string) => {
    dispatch(removeOtherTabs(key));
    navigate(tabs.find((t) => t.key === key)?.path || '/dashboard');
  };

  const handleCloseRight = (key: string) => {
    dispatch(removeRightTabs(key));
  };

  const handleCloseLeft = (key: string) => {
    dispatch(removeLeftTabs(key));
  };

  const handleCloseAll = () => {
    dispatch(clearTabs());
    navigate('/dashboard');
  };

  return (
    <div className="flex items-end h-9 bg-muted px-2 pt-2 overflow-x-auto border-b">
      {translatedTabs.map((tab, index) => (
        <ContextMenu key={tab.key}>
          <ContextMenuTrigger>
            <div
              onClick={() => handleTabClick(tab.key, tab.path)}
              className={cn(
                'group relative flex items-center gap-2 px-4 py-1.5 text-sm cursor-pointer transition-all min-w-[120px] max-w-[200px]',
                activeKey === tab.key
                  ? 'bg-background text-foreground rounded-t-lg z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] border border-b-0 border-border -mb-px'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-t-md',
                index > 0 && activeKey !== tab.key && 'border-l border-border/30'
              )}
            >
              <span className="truncate flex-1">{tab.displayLabel}</span>
              {tab.closable !== false && (
                <span
                  className="flex items-center justify-center h-4 w-4 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-all"
                  onClick={(e) => handleTabClose(e, tab.key)}
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleRefresh(tab.key, tab.path)}>
              <RotateCw className="h-4 w-4 mr-2" />
              {t('tabs.refresh')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            {tab.closable !== false && (
              <ContextMenuItem onClick={() => dispatch(removeTab(tab.key))}>
                {t('tabs.closeCurrent')}
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => handleCloseOthers(tab.key)}>
              {t('tabs.closeOthers')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCloseLeft(tab.key)}>
              {t('tabs.closeLeft')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCloseRight(tab.key)}>
              {t('tabs.closeRight')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleCloseAll}>
              {t('tabs.closeAll')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
