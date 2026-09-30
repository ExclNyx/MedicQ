import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../core/constants/colors';
import type { UserRole } from '../../core/models';

// PRD: pasien & petugas masuk lewat form yang sama (F-P01, F-ST01).
// Peran ditentukan dari data akun di Firestore, bukan dipilih di layar ini.
type LoginRole = Extract<UserRole, 'patient' | 'staff'>;

const HOME_BY_ROLE = {
  patient: '/(patient)/home',
  staff: '/(staff)/dashboard',
} as const satisfies Record<LoginRole, string>;

// TODO (tim backend): ganti dengan authService.signInWithEmail(email, password),
// lalu arahkan berdasarkan user.role hasil dari Firestore.
// Sementara mode demo: email yang diawali "petugas" dianggap petugas,
// selain itu dianggap pasien.
async function signInDemo(email: string, _password: string): Promise<LoginRole> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return email.trim().toLowerCase().startsWith('petugas') ? 'staff' : 'patient';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

type Field = 'email' | 'password';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<Field | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const role = await signInDemo(email, password);
      router.replace(HOME_BY_ROLE[role]);
    } catch {
      setError('Email atau kata sandi salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header / branding */}
        <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
          <View style={styles.logo} accessibilityElementsHidden>
            <View style={styles.crossVertical} />
            <View style={styles.crossHorizontal} />
          </View>
          <Text style={styles.appName}>MedicQueue</Text>
          <Text style={styles.tagline}>Sistem Antrean Digital Puskesmas</Text>
        </View>

        {/* Form */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Masuk</Text>
            <Text style={styles.subtitle}>
              Pasien dan petugas masuk dari sini. Peran Anda dikenali otomatis dari akun.
            </Text>

            {error && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, focused === 'email' && styles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="nama@email.com"
              placeholderTextColor={Colors.outline}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
              accessibilityLabel="Email"
            />

            <Text style={styles.label}>Kata Sandi</Text>
            <View style={[styles.inputRow, focused === 'password' && styles.inputFocused]}>
              <TextInput
                ref={passwordRef}
                style={styles.inputInner}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Masukkan kata sandi"
                placeholderTextColor={Colors.outline}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
                accessibilityLabel="Kata sandi"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.toggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                <Text style={styles.toggleText}>{showPassword ? 'Sembunyikan' : 'Lihat'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Masuk"
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Belum punya akun?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={styles.registerLink}
                accessibilityRole="link"
              >
                <Text style={styles.registerLinkText}>Daftar sebagai pasien</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hanya tampil saat development. Layar TV dibuka langsung di /display (PRD Alur C). */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={() => router.push('/display')}
              style={styles.devLink}
              accessibilityRole="link"
            >
              <Text style={styles.devLinkText}>[Dev] Buka Display Board TV</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  // Header
  hero: {
    alignItems: 'center',
    paddingBottom: 72,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crossVertical: {
    position: 'absolute',
    width: 14,
    height: 40,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  appName: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: 0.3,
  },
  tagline: {
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingHorizontal: 24,
    fontSize: 14,
    color: Colors.primaryContainer,
    marginTop: 4,
  },

  // Card
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -44,
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
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: Colors.errorContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.error, fontWeight: '600' },

  // Inputs
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.onSurface,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  inputRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginBottom: 20,
  },
  inputInner: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  inputFocused: { borderColor: Colors.primary },
  toggle: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  toggleText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Button
  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '700', color: Colors.onPrimary },

  // Register
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 20 },
  registerRow: { alignSelf: 'stretch' },
  registerText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  registerLink: { alignSelf: 'stretch', minHeight: 44, justifyContent: 'center' },
  registerLinkText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Dev only
  devLink: { alignItems: 'center', paddingVertical: 16 },
  devLinkText: { fontSize: 12, color: Colors.outline },
});