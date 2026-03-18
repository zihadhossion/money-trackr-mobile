// Exact values from money-trackr-frontend/app/app.css

export const lightColors = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  borderColor: '#e2e8f0',

  // Brand colors (same in both themes)
  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  rose: '#f43f5e',

  // Surface scale
  surface50: '#f8fafc',
  surface100: '#f1f5f9',
  surface200: '#e2e8f0',
  surface300: '#cbd5e1',
  surface400: '#94a3b8',
  surface500: '#64748b',
  surface600: '#475569',
  surface700: '#334155',
  surface800: '#1e293b',
  surface900: '#0f172a',

  white: '#ffffff',
  black: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
};

export const darkColors: typeof lightColors = {
  bgPrimary: '#0f172a',
  bgSecondary: '#020617',
  bgTertiary: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  borderColor: '#1e293b',

  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  rose: '#f43f5e',

  surface50: '#f8fafc',
  surface100: '#f1f5f9',
  surface200: '#e2e8f0',
  surface300: '#cbd5e1',
  surface400: '#94a3b8',
  surface500: '#64748b',
  surface600: '#475569',
  surface700: '#334155',
  surface800: '#1e293b',
  surface900: '#0f172a',

  white: '#ffffff',
  black: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export type Colors = typeof lightColors;
