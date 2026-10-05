// Material 3 color palette for MedicQueue — light & dark
export const palette = {
  light: {
    primary: '#1565C0',
    primaryLight: '#1976D2',
    primaryDeep: '#0D47A1',
    primarySoft: '#1E88E5',
    primaryContainer: '#BBDEFB',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#E3F2FD',
    onPrimaryContainer: '#0D47A1',

    secondary: '#2E7D32',
    secondaryContainer: '#C8E6C9',
    onSecondary: '#FFFFFF',

    background: '#F3F7FC',
    surface: '#FFFFFF',
    surfaceSoft: '#F0F6FF',
    surfaceVariant: '#EEF2FF',
    onSurface: '#1A1C1E',
    onSurfaceVariant: '#44474F',

    error: '#B00020',
    errorContainer: '#FFEDEA',
    onError: '#FFFFFF',

    outline: '#74777F',
    outlineVariant: '#C4C6D0',

    focusGlow: 'rgba(21, 101, 192, 0.18)',
    cardBorder: 'rgba(13, 71, 161, 0.08)',

    statusWaiting: '#F57C00',
    statusWaitingBg: '#FFF3E0',
    statusCalled: '#1565C0',
    statusCalledBg: '#E3F2FD',
    statusServing: '#2E7D32',
    statusServingBg: '#E8F5E9',
    statusCompleted: '#546E7A',
    statusCompletedBg: '#ECEFF1',
    statusSkipped: '#C62828',
    statusSkippedBg: '#FFEBEE',

    warning: '#F9A825',
    warningBg: '#FFFDE7',
    success: '#388E3C',
    successBg: '#E8F5E9',

    white: '#FFFFFF',
    black: '#000000',
    grey100: '#F5F5F5',
    grey200: '#EEEEEE',
    grey300: '#E0E0E0',
    grey600: '#757575',
    grey800: '#424242',

    transparent: 'transparent',
  },
  dark: {
    primary: '#1565C0',
    primaryLight: '#1E88E5',
    primaryDeep: '#0A1628',
    primarySoft: '#1E88E5',
    primaryContainer: '#0D2847',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#BBDEFB',
    onPrimaryContainer: '#BBDEFB',

    secondary: '#81C784',
    secondaryContainer: '#1B3A20',
    onSecondary: '#0B1F10',

    background: '#0B1220',
    surface: '#152033',
    surfaceSoft: '#182842',
    surfaceVariant: '#1A2740',
    onSurface: '#E8EEF7',
    onSurfaceVariant: '#A8B6C8',

    error: '#FFB4AB',
    errorContainer: '#5C1A1A',
    onError: '#690005',

    outline: '#8A9BB0',
    outlineVariant: '#3A4A60',

    focusGlow: 'rgba(66, 165, 245, 0.35)',
    cardBorder: 'rgba(144, 202, 249, 0.12)',

    statusWaiting: '#FFB74D',
    statusWaitingBg: '#3D2E10',
    statusCalled: '#90CAF9',
    statusCalledBg: '#0D2847',
    statusServing: '#81C784',
    statusServingBg: '#1B3A20',
    statusCompleted: '#90A4AE',
    statusCompletedBg: '#1C2430',
    statusSkipped: '#EF9A9A',
    statusSkippedBg: '#4A1520',

    warning: '#FFD54F',
    warningBg: '#3D3410',
    success: '#81C784',
    successBg: '#1B3A20',

    white: '#FFFFFF',
    black: '#000000',
    grey100: '#2A3344',
    grey200: '#334155',
    grey300: '#475569',
    grey600: '#94A3B8',
    grey800: '#CBD5E1',

    transparent: 'transparent',
  },
} as const;

export type AppColors = (typeof palette)['light'];
export type ColorKey = keyof AppColors;

/** Palette light — dipakai komponen yang belum pakai useColors(). */
export const Colors: AppColors = palette.light;
export const DarkColors: AppColors = palette.dark;
