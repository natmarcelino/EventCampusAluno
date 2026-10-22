// src/styles/theme.js
export const colors = {
  primary: '#8B7FD9',        // lavanda
  primaryLight: '#EFEDFC',
  primaryDark: '#5A4FB0',

  peach: '#FF9B7B',
  peachLight: '#FFEEE6',
  peachDark: '#D9603A',

  mint: '#6FCBA8',
  mintLight: '#E6F7F0',
  mintDark: '#2F9C72',

  sun: '#FFC859',
  sunLight: '#FFF6E0',
  sunDark: '#C98E1E',

  red: '#E0566B',
  redLight: '#FBE6EA',
  redDark: '#A82F44',

  gray100: '#ECEAF6',
  gray200: '#D9D6EC',
  gray400: '#B3AFCB',
  gray600: '#8580A3',

  white: '#FFFFFF',
  background: '#FBFAFE',
  surface: '#FFFFFF',
  border: 'rgba(139,127,217,0.14)',

  textPrimary: '#2E2A45',
  textSecondary: '#8580A3',
  textHint: '#B3AFCB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '600', color: colors.textPrimary },
  h2: { fontSize: 19, fontWeight: '600', color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  label: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },
};

export const shadow = {
  sm: {
    shadowColor: '#8B7FD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#8B7FD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
};