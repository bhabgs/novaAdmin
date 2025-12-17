export interface ThemeConfig {
  mode: "light" | "dark";
  primaryColor: string;
  borderRadius: number;
}

export interface PresetTheme {
  name: string;
  key: string;
  colors: string[];
  config: ThemeConfig;
}

// Preset theme colors
export const PRESET_COLORS = [
  "#1890ff", // Default blue
  "#52c41a", // Green
  "#fa8c16", // Orange
  "#eb2f96", // Pink
  "#722ed1", // Purple
  "#13c2c2", // Cyan
  "#f5222d", // Red
  "#fa541c", // Volcano
  "#faad14", // Gold
  "#a0d911", // Lime
  "#1677ff", // Bright blue
  "#00b96b", // Emerald
];

// Preset theme configurations (without i18n keys)
export const PRESET_THEME_CONFIGS = {
  default: {
    key: "default",
    colors: ["#1890ff", "#f0f2f5", "#ffffff"],
    config: {
      mode: "light" as const,
      primaryColor: "#1890ff",
      borderRadius: 6,
    },
  },
  dark: {
    key: "dark",
    colors: ["#1890ff", "#141414", "#1f1f1f"],
    config: {
      mode: "dark" as const,
      primaryColor: "#1890ff",
      borderRadius: 6,
    },
  },
  tech: {
    key: "tech",
    colors: ["#1677ff", "#f0f5ff", "#ffffff"],
    config: {
      mode: "light" as const,
      primaryColor: "#1677ff",
      borderRadius: 8,
    },
  },
  nature: {
    key: "nature",
    colors: ["#52c41a", "#f6ffed", "#ffffff"],
    config: {
      mode: "light" as const,
      primaryColor: "#52c41a",
      borderRadius: 6,
    },
  },
};

// Helper function to get preset themes with i18n labels
export function getPresetThemes(t: (key: string) => string): PresetTheme[] {
  return [
    {
      name: t("settings.defaultTheme"),
      ...PRESET_THEME_CONFIGS.default,
    },
    {
      name: t("settings.darkTheme"),
      ...PRESET_THEME_CONFIGS.dark,
    },
    {
      name: t("settings.techBlue"),
      ...PRESET_THEME_CONFIGS.tech,
    },
    {
      name: t("settings.natureGreen"),
      ...PRESET_THEME_CONFIGS.nature,
    },
  ];
}

// Theme color validation
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// Get theme mode icon
export function getThemeModeIcon(mode: "light" | "dark"): "sun" | "moon" {
  return mode === "light" ? "sun" : "moon";
}
