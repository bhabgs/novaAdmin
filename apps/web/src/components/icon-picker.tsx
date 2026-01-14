import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { iconMap, iconCategories } from '@/config/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = '选择图标' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const SelectedIcon = value ? iconMap[value] : null;

  // 根据搜索过滤图标
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return null;

    const query = searchQuery.toLowerCase();
    return Object.keys(iconMap).filter((iconName) =>
      iconName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {value && (
            <X
              className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0" align="start">
        <div className="flex flex-col">
          {/* 搜索框 */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索图标..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 图标列表 */}
          <ScrollArea className="h-[400px]">
            {filteredIcons ? (
              // 搜索结果
              <div className="p-3">
                <div className="grid grid-cols-8 gap-2">
                  {filteredIcons.map((iconName) => {
                    const Icon = iconMap[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => handleSelect(iconName)}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                          value === iconName && 'bg-accent'
                        )}
                        title={iconName}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    未找到匹配的图标
                  </div>
                )}
              </div>
            ) : (
              // 分类展示
              <Tabs defaultValue={Object.keys(iconCategories)[0]} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b px-3 h-auto flex-wrap gap-1 py-2">
                  {Object.keys(iconCategories).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="rounded-md text-xs"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <TabsContent key={category} value={category} className="p-3 mt-0">
                    <div className="grid grid-cols-8 gap-2">
                      {icons.map((iconName) => {
                        const Icon = iconMap[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => handleSelect(iconName)}
                            className={cn(
                              'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                              value === iconName && 'bg-accent'
                            )}
                            title={iconName}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
