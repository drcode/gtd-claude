/**
 * GTD Claude Theme Colors
 */

import { Platform } from 'react-native';

// GTD App specific colors (dark theme only)
export const GTDColors = {
  background: '#1a1a1a',
  backgroundSecondary: '#252525',
  text: '#e0e0e0',
  textMuted: '#888888',
  border: '#444444',
  hover: '#333333',
  cyan: '#00befc',
  green: '#27ae60',
  red: '#eb5757',
  purple: '#be50ff',
  statusBg: '#3d3d00',
  statusBorder: '#666600',
  statusText: '#ffeb3b',
  errorBg: '#3d1a1a',
};

const tintColorLight = '#0a7ea4';
const tintColorDark = GTDColors.cyan;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: GTDColors.text,
    background: GTDColors.background,
    tint: tintColorDark,
    icon: GTDColors.textMuted,
    tabIconDefault: GTDColors.textMuted,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
