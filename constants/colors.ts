// KOURT Design System - Colors
export const colors = {
  // Primary
  primary: '#000000',
  accent: '#84CC16', // Lime verde Kourt

  // Backgrounds
  background: '#FAFAFA',
  card: '#FFFFFF',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  black: '#000000',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Premium (Pro)
  gold: '#D4AF37',
  goldLight: '#F4E4A6',
  proBackground: '#0A0A0A',

  // Text
  text: {
    primary: '#000000',
    secondary: '#525252',
    muted: '#737373',
    placeholder: '#A3A3A3',
    inverse: '#FFFFFF',
  },

  // Border
  border: '#E5E5E5',
  borderLight: '#F5F5F5',

  // Sports
  sports: {
    beachTennis: '#F59E0B',
    padel: '#3B82F6',
    tennis: '#22C55E',
    volleyball: '#EF4444',
    football: '#8B5CF6',
    basketball: '#F97316',
    futevolei: '#06B6D4',
  },

  // Results
  result: {
    win: '#22C55E',
    winBg: '#F0FDF4',
    loss: '#EF4444',
    lossBg: '#FEF2F2',
    draw: '#F59E0B',
    drawBg: '#FFFBEB',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  screenPadding: 20,
  cardPadding: 16,
  sectionGap: 24,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
  button: 9999, // Pill buttons
  card: 16,
  modal: 24,
  avatar: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
  '7xl': 48,
  score: 48,
} as const;

// Kourt brand gradients
export const gradients = {
  primary: ['#000000', '#262626'],
  accent: ['#84CC16', '#65A30D'],
  gold: ['#D4AF37', '#B8860B'],
  success: ['#22C55E', '#16A34A'],
} as const;
