import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tabs, activeKey } = useAppSelector((state) => state.tabs);

  const handleTabClick = (tab: TabItem) => {
    dispatch(setActiveTab(tab.key));
    navigate(tab.path);
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

  const handleRefresh = (tab: TabItem) => {
    if (tab.key !== activeKey) {
      dispatch(setActiveTab(tab.key));
      navigate(tab.path);
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
    <div className="flex items-end h-9 bg-muted/50 px-2 pt-2 overflow-x-auto">
      {tabs.map((tab, index) => (
        <ContextMenu key={tab.key}>
          <ContextMenuTrigger>
            <div
              onClick={() => handleTabClick(tab)}
              className={cn(
                'group relative flex items-center gap-2 px-4 py-1.5 text-sm cursor-pointer transition-all min-w-[120px] max-w-[200px]',
                activeKey === tab.key
                  ? 'bg-background text-foreground rounded-t-lg z-10 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-t-md',
                index > 0 && activeKey !== tab.key && 'border-l border-border/50'
              )}
            >
              <span className="truncate flex-1">{tab.label}</span>
              {tab.closable !== false && (
                <span
                  className="flex items-center justify-center h-4 w-4 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                  onClick={(e) => handleTabClose(e, tab.key)}
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                </span>
              )}
              {activeKey === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-background" />
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleRefresh(tab)}>
              <RotateCw className="h-4 w-4 mr-2" />
              刷新
            </ContextMenuItem>
            <ContextMenuSeparator />
            {tab.closable !== false && (
              <ContextMenuItem onClick={() => dispatch(removeTab(tab.key))}>
                关闭当前
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => handleCloseOthers(tab.key)}>
              关闭其他
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCloseLeft(tab.key)}>
              关闭左侧
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCloseRight(tab.key)}>
              关闭右侧
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleCloseAll}>
              关闭所有
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
