// Material 3 color palette for PuskesmasQueue
export const Colors = {
  primary: '#1565C0',
  primaryLight: '#1976D2',
  primaryContainer: '#BBDEFB',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0D47A1',

  secondary: '#2E7D32',
  secondaryContainer: '#C8E6C9',
  onSecondary: '#FFFFFF',

  background: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF2FF',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#44474F',

  error: '#B00020',
  errorContainer: '#FFEDEA',
  onError: '#FFFFFF',

  outline: '#74777F',
  outlineVariant: '#C4C6D0',

  // Queue status colors
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

  // Alert colors
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
} as const;

export type ColorKey = keyof typeof Colors;
