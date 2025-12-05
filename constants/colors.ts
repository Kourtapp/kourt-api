export const colors = {
  primary: '#000000',
  background: '#FAFAFA',
  card: '#FFFFFF',
  border: '#E5E5E5',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  sports: {
    beachTennis: '#F59E0B',
    padel: '#3B82F6',
    tennis: '#22C55E',
    volleyball: '#EF4444',
    football: '#8B5CF6',
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
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
