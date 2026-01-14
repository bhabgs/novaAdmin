import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sun, Moon, Monitor, Check, Layout, Layers, Sparkles, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const themes = [
  { value: 'light', labelKey: 'setting.light', icon: Sun },
  { value: 'dark', labelKey: 'setting.dark', icon: Moon },
  { value: 'system', labelKey: 'setting.system', icon: Monitor },
] as const;

const primaryColors = [
  { name: 'Zinc', value: '240 5.9% 10%', class: 'bg-zinc-900' },
  { name: 'Slate', value: '222.2 47.4% 11.2%', class: 'bg-slate-900' },
  { name: 'Stone', value: '24 9.8% 10%', class: 'bg-stone-900' },
  { name: 'Gray', value: '220.9 39.3% 11%', class: 'bg-gray-900' },
  { name: 'Red', value: '0 72.2% 50.6%', class: 'bg-red-600' },
  { name: 'Rose', value: '346.8 77.2% 49.8%', class: 'bg-rose-600' },
  { name: 'Orange', value: '24.6 95% 53.1%', class: 'bg-orange-500' },
  { name: 'Green', value: '142.1 76.2% 36.3%', class: 'bg-green-600' },
  { name: 'Blue', value: '221.2 83.2% 53.3%', class: 'bg-blue-600' },
  { name: 'Violet', value: '262.1 83.3% 57.8%', class: 'bg-violet-600' },
];

const radiusOptions = [
  { value: '0', labelKey: 'setting.radiusNone' },
  { value: '0.3', labelKey: 'setting.radiusSmall' },
  { value: '0.5', labelKey: 'setting.radiusMedium' },
  { value: '0.75', labelKey: 'setting.radiusLarge' },
  { value: '1', labelKey: 'setting.radiusRound' },
];

const languages = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
];

const PRIMARY_KEY = 'nova-admin-primary';
const RADIUS_KEY = 'nova-admin-radius';
const LAYOUT_KEY = 'nova-admin-layout';
const TABS_KEY = 'nova-admin-tabs';
const ANIMATION_KEY = 'nova-admin-animation';
const NOTIFICATION_KEY = 'nova-admin-notification';

export default function SystemSetting() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem(PRIMARY_KEY) || '220.9 39.3% 11%');
  const [radius, setRadius] = useState(() => localStorage.getItem(RADIUS_KEY) || '0.5');

  // 布局设置
  const [layoutConfig, setLayoutConfig] = useState(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? JSON.parse(saved) : {
      fixedHeader: true,
      sidebarWidth: 'default',
      contentWidth: 'fluid',
    };
  });

  // 标签页设置
  const [tabsConfig, setTabsConfig] = useState(() => {
    const saved = localStorage.getItem(TABS_KEY);
    return saved ? JSON.parse(saved) : {
      showTabs: true,
      maxTabs: 10,
      persistTabs: true,
    };
  });

  // 动画设置
  const [animationConfig, setAnimationConfig] = useState(() => {
    const saved = localStorage.getItem(ANIMATION_KEY);
    return saved ? JSON.parse(saved) : {
      enablePageTransition: true,
      enableLoadingAnimation: true,
      transitionSpeed: 'normal',
    };
  });

  // 通知设置
  const [notificationConfig, setNotificationConfig] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATION_KEY);
    return saved ? JSON.parse(saved) : {
      position: 'top-right',
      duration: 3000,
      enableSound: false,
    };
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    localStorage.setItem(PRIMARY_KEY, primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
    localStorage.setItem(RADIUS_KEY, radius);
  }, [radius]);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  useEffect(() => {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabsConfig));
  }, [tabsConfig]);

  useEffect(() => {
    localStorage.setItem(ANIMATION_KEY, JSON.stringify(animationConfig));
  }, [animationConfig]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notificationConfig));
  }, [notificationConfig]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('setting.title')}</h1>
        <p className="text-muted-foreground">{t('setting.description')}</p>
      </div>

      {/* 语言设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('setting.language')}</CardTitle>
          <CardDescription>{t('setting.languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {languages.map((lang) => (
              <div
                key={lang.value}
                onClick={() => changeLanguage(lang.value)}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                  i18n.language === lang.value ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 外观模式 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('setting.appearance')}</CardTitle>
          <CardDescription>{t('setting.appearanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {themes.map(({ value, labelKey, icon: Icon }) => (
              <div
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                  theme === value ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={cn('h-6 w-6', theme === value && 'text-primary')} />
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 主色调 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('setting.primaryColor')}</CardTitle>
          <CardDescription>{t('setting.primaryColorDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {primaryColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setPrimaryColor(color.value)}
                className={cn(
                  'relative h-10 w-10 rounded-full transition-all hover:scale-110',
                  color.class
                )}
                title={color.name}
              >
                {primaryColor === color.value && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 圆角大小 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('setting.radius')}</CardTitle>
          <CardDescription>{t('setting.radiusDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {radiusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRadius(option.value)}
                className={cn(
                  'flex-1 rounded-lg border-2 py-2 text-sm transition-all',
                  radius === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-16 text-muted-foreground">{t('setting.preview')}</Label>
            <div className="flex gap-2">
              <div className="h-10 w-20 rounded-[var(--radius)] bg-primary" />
              <div className="h-10 w-20 rounded-[var(--radius)] border-2 border-primary" />
              <button className="h-10 px-4 rounded-[var(--radius)] bg-primary text-primary-foreground text-sm">
                {t('setting.button')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 布局设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            <CardTitle>布局设置</CardTitle>
          </div>
          <CardDescription>自定义系统布局和显示方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>固定头部</Label>
              <p className="text-sm text-muted-foreground">头部导航栏固定在顶部</p>
            </div>
            <Switch
              checked={layoutConfig.fixedHeader}
              onCheckedChange={(checked) =>
                setLayoutConfig({ ...layoutConfig, fixedHeader: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>侧边栏宽度</Label>
            <Select
              value={layoutConfig.sidebarWidth}
              onValueChange={(value) =>
                setLayoutConfig({ ...layoutConfig, sidebarWidth: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">紧凑 (200px)</SelectItem>
                <SelectItem value="default">默认 (240px)</SelectItem>
                <SelectItem value="wide">宽 (280px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>内容区域宽度</Label>
            <Select
              value={layoutConfig.contentWidth}
              onValueChange={(value) =>
                setLayoutConfig({ ...layoutConfig, contentWidth: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fluid">流式布局</SelectItem>
                <SelectItem value="fixed">固定宽度 (1200px)</SelectItem>
                <SelectItem value="wide">宽屏 (1400px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 标签页设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            <CardTitle>标签页设置</CardTitle>
          </div>
          <CardDescription>配置页面标签页的行为</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>显示标签页</Label>
              <p className="text-sm text-muted-foreground">在顶部显示页面标签</p>
            </div>
            <Switch
              checked={tabsConfig.showTabs}
              onCheckedChange={(checked) =>
                setTabsConfig({ ...tabsConfig, showTabs: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>持久化标签</Label>
              <p className="text-sm text-muted-foreground">刷新页面后保留已打开的标签</p>
            </div>
            <Switch
              checked={tabsConfig.persistTabs}
              onCheckedChange={(checked) =>
                setTabsConfig({ ...tabsConfig, persistTabs: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>最大标签数量: {tabsConfig.maxTabs}</Label>
            <Slider
              value={[tabsConfig.maxTabs]}
              onValueChange={([value]) =>
                setTabsConfig({ ...tabsConfig, maxTabs: value })
              }
              min={5}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              超过此数量时，最早打开的标签将被自动关闭
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 动画设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <CardTitle>动画设置</CardTitle>
          </div>
          <CardDescription>控制页面动画和过渡效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>页面切换动画</Label>
              <p className="text-sm text-muted-foreground">路由切换时的过渡效果</p>
            </div>
            <Switch
              checked={animationConfig.enablePageTransition}
              onCheckedChange={(checked) =>
                setAnimationConfig({ ...animationConfig, enablePageTransition: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>加载动画</Label>
              <p className="text-sm text-muted-foreground">数据加载时的动画效果</p>
            </div>
            <Switch
              checked={animationConfig.enableLoadingAnimation}
              onCheckedChange={(checked) =>
                setAnimationConfig({ ...animationConfig, enableLoadingAnimation: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>动画速度</Label>
            <Select
              value={animationConfig.transitionSpeed}
              onValueChange={(value) =>
                setAnimationConfig({ ...animationConfig, transitionSpeed: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">慢速 (500ms)</SelectItem>
                <SelectItem value="normal">正常 (300ms)</SelectItem>
                <SelectItem value="fast">快速 (150ms)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>通知设置</CardTitle>
          </div>
          <CardDescription>配置系统通知的显示方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>通知位置</Label>
            <Select
              value={notificationConfig.position}
              onValueChange={(value) =>
                setNotificationConfig({ ...notificationConfig, position: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">左上角</SelectItem>
                <SelectItem value="top-center">顶部居中</SelectItem>
                <SelectItem value="top-right">右上角</SelectItem>
                <SelectItem value="bottom-left">左下角</SelectItem>
                <SelectItem value="bottom-center">底部居中</SelectItem>
                <SelectItem value="bottom-right">右下角</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>显示时长: {notificationConfig.duration / 1000}秒</Label>
            <Slider
              value={[notificationConfig.duration]}
              onValueChange={([value]) =>
                setNotificationConfig({ ...notificationConfig, duration: value })
              }
              min={1000}
              max={10000}
              step={500}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>声音提示</Label>
              <p className="text-sm text-muted-foreground">通知时播放提示音</p>
            </div>
            <Switch
              checked={notificationConfig.enableSound}
              onCheckedChange={(checked) =>
                setNotificationConfig({ ...notificationConfig, enableSound: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
