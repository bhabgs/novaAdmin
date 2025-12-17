import React, { useState, useCallback } from 'react';
import {
  Card,
  Typography,
  Switch,
  Slider,
  Button,
  Space,
  Tooltip,
  message,
  Row,
  Col,
  Segmented,
} from 'antd';
import {
  BgColorsOutlined,
  CheckOutlined,
  DownloadOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
  LayoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateTheme, resetSettings, updateLayout } from '../../store/slices/settingsSlice';
import { PRESET_COLORS, getPresetThemes } from '../../constants/theme';
import { LayoutMode } from '../../types';
import styles from './index.module.less';

const { Title, Text } = Typography;

const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { theme, layout } = useAppSelector((state) => state.settings);
  const [customColor, setCustomColor] = useState(theme.primaryColor);

  const PRESET_THEMES = getPresetThemes(t);

  // 布局模式选项
  const layoutModeOptions = [
    { label: t('settings.sideMenu'), value: 'side' as LayoutMode, icon: <MenuFoldOutlined /> },
    { label: t('settings.topMenu'), value: 'top' as LayoutMode, icon: <MenuUnfoldOutlined /> },
    { label: t('settings.mixMenu'), value: 'mix' as LayoutMode, icon: <AppstoreOutlined /> },
  ];

  const handleModeChange = useCallback((mode: 'light' | 'dark') => {
    dispatch(updateTheme({ mode }));
    message.success(t('settings.themeUpdateSuccess'));
  }, [dispatch, t]);

  const handleColorChange = useCallback((color: string) => {
    setCustomColor(color);
    dispatch(updateTheme({ primaryColor: color }));
    message.success(t('settings.colorUpdateSuccess'));
  }, [dispatch, t]);

  const handleBorderRadiusChange = useCallback((value: number) => {
    dispatch(updateTheme({ borderRadius: value }));
  }, [dispatch]);

  // 布局模式切换
  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    dispatch(updateLayout({ mode }));
    message.success(t('settings.layoutUpdateSuccess'));
  }, [dispatch, t]);

  // 固定头部切换
  const handleFixedHeaderChange = useCallback((checked: boolean) => {
    dispatch(updateLayout({ fixedHeader: checked }));
  }, [dispatch]);

  // 显示标签页切换
  const handleShowTabsChange = useCallback((checked: boolean) => {
    dispatch(updateLayout({ showTabs: checked }));
  }, [dispatch]);

  // 侧边栏宽度变更
  const handleSidebarWidthChange = useCallback((value: number) => {
    dispatch(updateLayout({ sidebarWidth: value }));
  }, [dispatch]);

  // 侧边栏主题切换
  const handleSidebarThemeChange = useCallback((value: 'light' | 'dark') => {
    dispatch(updateLayout({ sidebarTheme: value }));
  }, [dispatch]);

  // 内容区域宽度切换
  const handleContentWidthChange = useCallback((value: 'fluid' | 'fixed') => {
    dispatch(updateLayout({ contentWidth: value }));
  }, [dispatch]);

  const handlePresetTheme = useCallback((preset: ReturnType<typeof getPresetThemes>[0]) => {
    dispatch(updateTheme(preset.config));
    setCustomColor(preset.config.primaryColor);
    message.success(t('settings.themeApplied', { name: preset.name }));
  }, [dispatch, t]);

  const handleReset = useCallback(() => {
    dispatch(resetSettings());
    setCustomColor('#1890ff');
    message.success(t('settings.resetSuccess'));
  }, [dispatch, t]);

  const handleExport = useCallback(() => {
    const config = {
      theme,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success(t('settings.themeExported'));
  }, [theme, t]);

  return (
    <div className={styles.themeSettings}>
      {/* 主题模式 */}
      <Card className={styles.themeCard} variant="borderless">
        <div className={styles.cardTitle}>
          <BgColorsOutlined className={styles.titleIcon} />
          {t('settings.themeMode')}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.themeMode}>
            <div className={styles.modeGrid}>
              <div
                className={`${styles.modeOption} ${
                  theme.mode === 'light' ? styles.active : ''
                }`}
                onClick={() => handleModeChange('light')}
              >
                <SunOutlined className={styles.modeIcon} />
                <div className={styles.modeText}>
                  <div className={styles.modeName}>{t('settings.lightTheme')}</div>
                  <div className={styles.modeDesc}>{t('settings.lightModeDesc')}</div>
                </div>
                <CheckOutlined className={styles.checkIcon} />
              </div>
              <div
                className={`${styles.modeOption} ${
                  theme.mode === 'dark' ? styles.active : ''
                }`}
                onClick={() => handleModeChange('dark')}
              >
                <MoonOutlined className={styles.modeIcon} />
                <div className={styles.modeText}>
                  <div className={styles.modeName}>{t('settings.darkTheme')}</div>
                  <div className={styles.modeDesc}>{t('settings.darkModeDesc')}</div>
                </div>
                <CheckOutlined className={styles.checkIcon} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 主题色设置 */}
      <Card className={styles.themeCard} variant="borderless">
        <div className={styles.cardTitle}>
          <BgColorsOutlined className={styles.titleIcon} />
          {t('settings.themeColors')}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.colorPicker}>
            <div className={styles.colorSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎨</span>
                {t('settings.presetColors')}
              </div>
              <div className={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <Tooltip key={color} title={color}>
                    <div
                      className={`${styles.colorItem} ${
                        theme.primaryColor === color ? styles.active : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    >
                      <CheckOutlined className={styles.checkIcon} />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className={styles.customColor}>
              <div className={styles.customColorLabel}>
                <span className={styles.customIcon}>🎯</span>
                {t('settings.customColor')}
              </div>
              <div className={styles.colorInputWrapper}>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className={styles.colorInput}
                />
                <span className={styles.colorValue}>{customColor}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 预设主题 */}
      <Card className={styles.themeCard} variant="borderless">
        <div className={styles.cardTitle}>
          <BgColorsOutlined className={styles.titleIcon} />
          {t('settings.presetThemes')}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.presetThemes}>
            <div className={styles.themePresets}>
              {PRESET_THEMES.map((preset) => (
                <div
                  key={preset.key}
                  className={`${styles.presetItem} ${
                    theme.mode === preset.config.mode &&
                    theme.primaryColor === preset.config.primaryColor
                      ? styles.active
                      : ''
                  }`}
                  onClick={() => handlePresetTheme(preset)}
                >
                  <div className={styles.presetPreview}>
                    {preset.colors.map((color, index) => (
                      <div
                        key={index}
                        className={styles.colorDot}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className={styles.presetName}>{preset.name}</div>
                  <CheckOutlined className={styles.activeIcon} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 布局设置 */}
      <Card className={styles.themeCard} variant="borderless">
        <div className={styles.cardTitle}>
          <LayoutOutlined className={styles.titleIcon} />
          {t('settings.layoutSettings')}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.layoutSettings}>
            {/* 布局模式 */}
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>
                <div className={styles.labelText}>{t('settings.layoutMode')}</div>
                <div className={styles.labelDesc}>{t('settings.layoutModeDesc')}</div>
              </div>
              <div className={styles.settingControl}>
                <Segmented
                  value={layout.mode}
                  onChange={(value) => handleLayoutModeChange(value as LayoutMode)}
                  options={layoutModeOptions.map(opt => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                />
              </div>
            </div>

            {/* 固定头部 */}
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>
                <div className={styles.labelText}>{t('settings.fixedHeader')}</div>
                <div className={styles.labelDesc}>{t('settings.fixedHeaderDesc')}</div>
              </div>
              <div className={styles.settingControl}>
                <Switch
                  checked={layout.fixedHeader}
                  onChange={handleFixedHeaderChange}
                />
              </div>
            </div>

            {/* 显示标签页 */}
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>
                <div className={styles.labelText}>{t('settings.showTabs')}</div>
                <div className={styles.labelDesc}>{t('settings.showTabsDesc')}</div>
              </div>
              <div className={styles.settingControl}>
                <Switch
                  checked={layout.showTabs}
                  onChange={handleShowTabsChange}
                />
              </div>
            </div>

            {/* 侧边栏宽度 - 仅在 side 或 mix 模式下显示 */}
            {layout.mode !== 'top' && (
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  <div className={styles.labelText}>{t('settings.sidebarWidth')}</div>
                  <div className={styles.labelDesc}>{t('settings.sidebarWidthDesc')}</div>
                </div>
                <div className={styles.settingControl}>
                  <div className={styles.sliderWrapper}>
                    <Slider
                      min={180}
                      max={300}
                      value={layout.sidebarWidth}
                      onChange={handleSidebarWidthChange}
                    />
                    <div className={styles.sliderValue}>{layout.sidebarWidth}px</div>
                  </div>
                </div>
              </div>
            )}

            {/* 侧边栏主题 - 仅在 side 或 mix 模式下显示 */}
            {layout.mode !== 'top' && (
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>
                  <div className={styles.labelText}>{t('settings.sidebarTheme')}</div>
                  <div className={styles.labelDesc}>{t('settings.sidebarThemeDesc')}</div>
                </div>
                <div className={styles.settingControl}>
                  <Segmented
                    value={layout.sidebarTheme}
                    onChange={(value) => handleSidebarThemeChange(value as 'light' | 'dark')}
                    options={[
                      { label: t('settings.sidebarLight'), value: 'light' },
                      { label: t('settings.sidebarDark'), value: 'dark' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* 圆角大小 */}
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>
                <div className={styles.labelText}>{t('settings.borderRadius')}</div>
                <div className={styles.labelDesc}>{t('settings.borderRadiusDesc')}</div>
              </div>
              <div className={styles.settingControl}>
                <div className={styles.sliderWrapper}>
                  <Slider
                    min={0}
                    max={16}
                    value={theme.borderRadius}
                    onChange={handleBorderRadiusChange}
                  />
                  <div className={styles.sliderValue}>{theme.borderRadius}px</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className={styles.actionButtons}>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          className={`${styles.actionBtn} ${styles.resetBtn}`}
        >
          {t('settings.resetTheme')}
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExport}
          className={`${styles.actionBtn} ${styles.exportBtn}`}
        >
          {t('settings.exportConfig')}
        </Button>
      </div>
    </div>
  );
};

export default ThemeSettings;