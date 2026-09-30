import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';

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
 */
export function AuthScreen({ title, subtitle, step, onBack, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },

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
