import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: '浅色', icon: Sun, description: '始终使用浅色主题' },
  { value: 'dark', label: '深色', icon: Moon, description: '始终使用深色主题' },
  { value: 'system', label: '跟随系统', icon: Monitor, description: '根据系统设置自动切换' },
] as const;

export default function SystemSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">管理系统的外观和行为设置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>主题设置</CardTitle>
          <CardDescription>选择您喜欢的界面主题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {themes.map(({ value, label, icon: Icon, description }) => (
              <div
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                  theme === value ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full',
                      theme === value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <Label className="font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
