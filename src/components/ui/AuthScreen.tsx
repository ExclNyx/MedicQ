import React, {
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';

/** Ruang kosong (px) yang dijaga di bawah kolom aktif, supaya pesan error/hint ikut terlihat. */
const SPACE_BELOW_FIELD = 64;

const ScrollToFocusedContext = createContext<() => void>(() => {});

/** Dipanggil kolom isian saat difokuskan, supaya layar menggulir dan kolomnya tidak tertutup keyboard. */
export function useScrollToFocusedInput() {
  return useContext(ScrollToFocusedContext);
}

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  /** Penanda langkah, contoh: { current: 1, total: 2 } */
  step?: { current: number; total: number };
  /** Kalau diisi, tombol "Kembali" muncul di header */
  onBack?: () => void;
  children: ReactNode;
}

/**
 * Kerangka layar untuk alur akun (register, lengkapi data diri):
 * header biru + kartu putih di bawahnya, sama gayanya dengan layar login.
 *
 * Keyboard: layar ini mengatur sendiri agar kolom yang sedang diisi selalu
 * terangkat di atas keyboard (di Android edge-to-edge KeyboardAvoidingView tidak cukup).
 */
export function AuthScreen({ title, subtitle, step, onBack, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | null>(null); // posisi atas keyboard di layar, null saat tertutup
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollFocusedIntoView = useCallback(() => {
    const top = keyboardTop.current;
    const input = TextInput.State.currentlyFocusedInput();
    if (top === null || !input) return;

    input.measureInWindow((_x, y, _width, height) => {
      const overlap = y + height + SPACE_BELOW_FIELD - top;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
      }
    });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
      // beri waktu agar ruang tambahan di bawah konten sudah terpasang
      setTimeout(scrollFocusedIntoView, 100);
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

  // Pindah antar kolom saat keyboard sudah terbuka (tombol "next"): gulir lagi.
  const scrollOnFocus = useMemo(() => () => setTimeout(scrollFocusedIntoView, 150), [scrollFocusedIntoView]);

  return (
    <ScrollToFocusedContext.Provider value={scrollOnFocus}>
      <View style={styles.container}>
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
          <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
            <View style={styles.inner}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.back}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali"
                >
                  <Text style={styles.backText}>‹  Kembali</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backSpacer} />
              )}

              {step && (
                <Text style={styles.step}>
                  Langkah {step.current} dari {step.total}
                </Text>
              )}
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.card}>{children}</View>
          </View>
        </ScrollView>
      </View>
    </ScrollToFocusedContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },

  hero: {
    backgroundColor: Colors.primary,
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  back: { alignSelf: 'flex-start', minWidth: 110, minHeight: 44, justifyContent: 'center' },
  backSpacer: { height: 12 },
  backText: { fontSize: 15, fontWeight: '600', color: Colors.onPrimary },
  step: { fontSize: 12, fontWeight: '600', color: Colors.primaryContainer, marginTop: 4 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.onPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, color: Colors.primaryContainer, marginTop: 6 },

  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
});
