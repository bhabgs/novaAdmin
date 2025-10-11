import React, { useState } from 'react';
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
} from 'antd';
import {
  BgColorsOutlined,
  CheckOutlined,
  DownloadOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateTheme, resetSettings } from '../../store/slices/settingsSlice';
import styles from './index.module.less';

const { Title, Text } = Typography;

// 预设主题色
const PRESET_COLORS = [
  '#1890ff', // 默认蓝色
  '#52c41a', // 绿色
  '#fa8c16', // 橙色
  '#eb2f96', // 粉色
  '#722ed1', // 紫色
  '#13c2c2', // 青色
  '#f5222d', // 红色
  '#fa541c', // 火红色
  '#faad14', // 金色
  '#a0d911', // 青绿色
  '#1677ff', // 亮蓝色
  '#00b96b', // 翠绿色
];

// 预设主题方案
const getPresetThemes = (t: any) => [
  {
    name: t('settings.defaultTheme'),
    key: 'default',
    colors: ['#1890ff', '#f0f2f5', '#ffffff'],
    config: {
      mode: 'light' as const,
      primaryColor: '#1890ff',
      borderRadius: 6,
    },
  },
  {
    name: t('settings.darkTheme'),
    key: 'dark',
    colors: ['#1890ff', '#141414', '#1f1f1f'],
    config: {
      mode: 'dark' as const,
      primaryColor: '#1890ff',
      borderRadius: 6,
    },
  },
  {
    name: t('settings.techBlue'),
    key: 'tech',
    colors: ['#1677ff', '#f0f5ff', '#ffffff'],
    config: {
      mode: 'light' as const,
      primaryColor: '#1677ff',
      borderRadius: 8,
    },
  },
  {
    name: t('settings.natureGreen'),
    key: 'nature',
    colors: ['#52c41a', '#f6ffed', '#ffffff'],
    config: {
      mode: 'light' as const,
      primaryColor: '#52c41a',
      borderRadius: 6,
    },
  },
];

const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.settings);
  const [customColor, setCustomColor] = useState(theme.primaryColor);

  const PRESET_THEMES = getPresetThemes(t);

  // 切换主题模式
  const handleModeChange = (mode: 'light' | 'dark') => {
    dispatch(updateTheme({ mode }));
    message.success(t('settings.themeUpdateSuccess'));
  };

  // 更改主题色
  const handleColorChange = (color: string) => {
    setCustomColor(color);
    dispatch(updateTheme({ primaryColor: color }));
    message.success(t('settings.colorUpdateSuccess'));
  };

  // 更改圆角大小
  const handleBorderRadiusChange = (value: number) => {
    dispatch(updateTheme({ borderRadius: value }));
  };

  // 应用预设主题
  const handlePresetTheme = (preset: ReturnType<typeof getPresetThemes>[0]) => {
    dispatch(updateTheme(preset.config));
    setCustomColor(preset.config.primaryColor);
    message.success(t('settings.themeApplied', { name: preset.name }));
  };

  // 重置主题
  const handleReset = () => {
    dispatch(resetSettings());
    setCustomColor('#1890ff');
    message.success(t('settings.resetSuccess'));
  };

  // 导出主题配置
  const handleExport = () => {
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
  };

  return (
    <div className={styles.themeSettings}>
      {/* 主题模式 */}
      <Card className={styles.themeCard} bordered={false}>
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
      <Card className={styles.themeCard} bordered={false}>
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
      <Card className={styles.themeCard} bordered={false}>
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
      <Card className={styles.themeCard} bordered={false}>
        <div className={styles.cardTitle}>
          <BgColorsOutlined className={styles.titleIcon} />
          {t('settings.layoutSettings')}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.layoutSettings}>
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>
                <div className={styles.labelText}>{t('settings.borderRadius')}</div>
                <div className={styles.labelDesc}>
                  {t('settings.borderRadiusDesc')}
                </div>
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