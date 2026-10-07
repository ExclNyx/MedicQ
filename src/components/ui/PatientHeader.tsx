import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../core/theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface PatientHeaderProps {
  title: string;
  subtitle?: string;
  /** Tampilkan tombol Kembali (default: true). */
  showBack?: boolean;
  onBack?: () => void;
  /** Elemen kanan atas; default = ThemeToggle. */
  right?: ReactNode;
  /** Konten tambahan di dalam hero (mis. sapaan besar di home). */
  children?: ReactNode;
}

/**
 * Header layar pasien — metrik sama dengan hero AuthScreen (login):
 * gradasi primaryDeep → primary → primarySoft, paddingBottom 64,
 * sudut bawah 32, supaya konten overlap (-40) tidak menimpa judul.
 */
export function PatientHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  children,
}: PatientHeaderProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const heroColors = [c.primaryDeep, c.primary, c.primarySoft] as const;

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <LinearGradient
      colors={heroColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={c.onPrimary} />
            <Text style={[styles.backText, { color: c.onPrimary }]}>Kembali</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}
        {right ?? <ThemeToggle />}
      </View>

      <View style={styles.inner}>
        {children ?? (
          <>
            <Text style={[styles.title, { color: c.onPrimary }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: c.onPrimaryMuted }]}>
                {subtitle}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 44,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 96,
    gap: 2,
  },
  backSpacer: { width: 96, height: 44 },
  backText: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  inner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: { fontSize: 24, fontWeight: '800', marginTop: 8, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
});
