import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../core/theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

/** Objek yang punya measureInWindow (instance TextInput). */
export interface MeasureTarget {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
}

/** Ruang kosong (px) yang dijaga di bawah kolom aktif, supaya pesan error/hint ikut terlihat. */
const SPACE_BELOW_FIELD = 64;

const ScrollToFocusedContext = createContext<(input?: MeasureTarget | null) => void>(() => {});

/** Dipanggil kolom isian saat difokuskan, supaya layar menggulir dan kolomnya tidak tertutup keyboard. */
export function useScrollToFocusedInput() {
  return useContext(ScrollToFocusedContext);
}

interface AuthBrand {
  name: string;
  tagline?: string;
  /** Logo kustom; default = ikon cross MedicQueue */
  logo?: ReactNode;
}

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  /** Penanda langkah, contoh: { current: 1, total: 2 } */
  step?: { current: number; total: number };
  /** Kalau diisi, tombol "Kembali" muncul di header */
  onBack?: () => void;
  /** Branding di hero (logo + nama app + tagline) — dipakai layar login */
  brand?: AuthBrand;
  /** Error form-level (bukan per-field), tampil di atas isi kartu */
  error?: string | null;
  children: ReactNode;
}

/**
 * Kerangka layar untuk alur akun: hero gradasi + kartu, mendukung dark mode.
 */
export function AuthScreen({
  title,
  subtitle,
  step,
  onBack,
  brand,
  error,
  children,
}: AuthScreenProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | null>(null);
  /** Input terakhir yang di-focus — dipakai ulang saat keyboard muncul. */
  const lastInputRef = useRef<MeasureTarget | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const heroColors = useMemo(
    () => [c.primaryDeep, c.primary, c.primarySoft] as const,
    [c.primaryDeep, c.primary, c.primarySoft]
  );

  /**
   * Gulir agar kolom aktif terlihat di atas keyboard.
   * Tidak memakai TextInput.State.currentlyFocusedInput() — API itu bisa
   * undefined di beberapa runtime RN/Expo dan bikin crash saat fokus.
   * Kolom meneruskan ref-nya sendiri lewat context.
   */
  const scrollFocusedIntoView = useCallback((input?: MeasureTarget | null) => {
    const target = input ?? lastInputRef.current;
    if (target) lastInputRef.current = target;

    const top = keyboardTop.current;
    if (top === null || !target || typeof target.measureInWindow !== 'function') return;

    try {
      target.measureInWindow((_x, y, _width, height) => {
        const overlap = y + height + SPACE_BELOW_FIELD - top;
        if (overlap > 0) {
          scrollRef.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
        }
      });
    } catch {
      // jangan sampai error native memblokir interaksi form
    }
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => scrollFocusedIntoView(), 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollFocusedIntoView]);

  // Pindah antar kolom (tombol next): gulir lagi ke input terakhir/terbaru.
  const scrollOnFocus = useMemo(
    () => (input?: MeasureTarget | null) => {
      setTimeout(() => scrollFocusedIntoView(input), 150);
    },
    [scrollFocusedIntoView]
  );

  const stepPercent = step ? Math.round((step.current / step.total) * 100) : 0;

  return (
    <ScrollToFocusedContext.Provider value={scrollOnFocus}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 24 : 32 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            scrollY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <LinearGradient
            colors={heroColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + 12 }]}
          >
            <View style={styles.headerRow}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.back}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali"
                >
                  <View style={styles.backRow}>
                    <Ionicons name="chevron-back" size={20} color={c.onPrimary} />
                    <Text style={[styles.backText, { color: c.onPrimary }]}>Kembali</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.backSpacer} />
              )}
              <ThemeToggle />
            </View>

            <View style={styles.inner}>
              {brand && (
                <View style={styles.brand}>
                  <View
                    style={styles.logo}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    {brand.logo ?? (
                      <>
                        <View style={styles.crossVertical} />
                        <View style={styles.crossHorizontal} />
                      </>
                    )}
                  </View>
                  <Text style={[styles.appName, { color: c.onPrimary }]}>{brand.name}</Text>
                  {brand.tagline ? (
                    <Text style={[styles.tagline, { color: c.onPrimaryMuted }]}>{brand.tagline}</Text>
                  ) : null}
                </View>
              )}

              {step && (
                <View style={styles.stepBlock}>
                  <Text style={[styles.step, { color: c.onPrimaryMuted }]}>
                    Langkah {step.current} dari {step.total}
                  </Text>
                  <View style={styles.stepTrack}>
                    <View
                      style={[styles.stepFill, { width: `${stepPercent}%`, backgroundColor: c.onPrimary }]}
                    />
                  </View>
                </View>
              )}
              <Text style={[styles.title, { color: c.onPrimary }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: c.onPrimaryMuted }]}>{subtitle}</Text>
              ) : null}
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.cardBorder },
              ]}
            >
              {error ? (
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: c.errorContainer, borderColor: c.error },
                  ]}
                  accessibilityRole="alert"
                >
                  <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
                </View>
              ) : null}
              {children}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScrollToFocusedContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  back: { alignSelf: 'flex-start', minWidth: 110, minHeight: 44, justifyContent: 'center' },
  backSpacer: { width: 110, height: 44 },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 15, fontWeight: '600', marginLeft: 2 },

  brand: { alignItems: 'center', marginBottom: 12, marginTop: 8 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crossVertical: {
    position: 'absolute',
    width: 14,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#1565C0',
  },
  crossHorizontal: {
    position: 'absolute',
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#1565C0',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
    paddingHorizontal: 24,
    textAlign: 'center',
  },

  stepBlock: { marginTop: 4 },
  step: { fontSize: 12, fontWeight: '600' },
  stepTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 8,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    borderRadius: 2,
  },
  title: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },

  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '600' },

  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
});
