import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor, Check, Languages } from 'lucide-react';
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

export default function SystemSetting() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem(PRIMARY_KEY) || '220.9 39.3% 11%');
  const [radius, setRadius] = useState(() => localStorage.getItem(RADIUS_KEY) || '0.5');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    localStorage.setItem(PRIMARY_KEY, primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
    localStorage.setItem(RADIUS_KEY, radius);
  }, [radius]);

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
    </div>
  );
}
