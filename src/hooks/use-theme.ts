/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/template-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // RN 0.88: useColorScheme hanya mengembalikan 'light' | 'dark' | null
  // (nilai 'unspecified' sudah dihapus). null = ikut sistem → pakai light.
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
