/**
 * Theme Management System
 * Light/Dark mode toggle with persistent storage
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  theme: Theme;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

const THEME_STORAGE_KEY = 'novaai-theme-settings';
const DEFAULT_SETTINGS: ThemeSettings = {
  theme: 'system',
  accentColor: '#7c3aed',
  fontSize: 'medium',
  compactMode: false,
};

/**
 * Get theme settings from storage
 */
export function getThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load theme settings:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save theme settings to storage
 */
export function saveThemeSettings(settings: ThemeSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save theme settings:', error);
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(currentTheme: Theme): Theme {
  if (currentTheme === 'light') return 'dark';
  if (currentTheme === 'dark') return 'system';
  return 'light';
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;

  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Apply accent color
 */
export function applyAccentColor(color: string): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--primary', color);
}

/**
 * Apply font size
 */
export function applyFontSize(size: 'small' | 'medium' | 'large'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const sizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };

  root.style.setProperty('--font-size-base', sizeMap[size]);
}

/**
 * Apply compact mode
 */
export function applyCompactMode(compact: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (compact) {
    root.classList.add('compact-mode');
  } else {
    root.classList.remove('compact-mode');
  }
}

/**
 * Initialize theme system and apply settings
 */
export function initThemeSystem(): ThemeSettings {
  const settings = getThemeSettings();

  applyTheme(settings.theme);
  applyAccentColor(settings.accentColor);
  applyFontSize(settings.fontSize);
  applyCompactMode(settings.compactMode);

  // Watch for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    });
  }

  return settings;
}

/**
 * Update a single theme setting
 */
export function updateThemeSetting(
  key: keyof ThemeSettings,
  value: any
): ThemeSettings {
  const settings = getThemeSettings();
  const updated = { ...settings, [key]: value };

  saveThemeSettings(updated);

  // Apply the change immediately
  if (key === 'theme') applyTheme(value);
  if (key === 'accentColor') applyAccentColor(value);
  if (key === 'fontSize') applyFontSize(value);
  if (key === 'compactMode') applyCompactMode(value);

  return updated;
}

/**
 * Get preset accent colors
 */
export function getAccentColorPresets(): { name: string; value: string }[] {
  return [
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
  ];
}

/**
 * Export theme settings
 */
export function exportThemeSettings(): string {
  const settings = getThemeSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import theme settings
 */
export function importThemeSettings(jsonString: string): ThemeSettings {
  try {
    const settings = JSON.parse(jsonString) as ThemeSettings;
    saveThemeSettings(settings);
    initThemeSystem();
    return settings;
  } catch (error) {
    throw new Error(`Failed to import theme settings: ${error}`);
  }
}

/**
 * Reset to default theme settings
 */
export function resetThemeToDefault(): ThemeSettings {
  saveThemeSettings(DEFAULT_SETTINGS);
  initThemeSystem();
  return DEFAULT_SETTINGS;
}
