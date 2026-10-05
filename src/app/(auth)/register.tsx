import { router } from 'expo-router';
import { useRef, useState, type RefObject } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthScreen } from '../../components/ui/AuthScreen';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useColors } from '../../core/theme/ThemeContext';

type Field = 'name' | 'email' | 'password' | 'confirm';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

/** Urutan fokus saat submit gagal validasi — field error pertama yang di-focus. */
const FIELD_ORDER: Field[] = ['name', 'email', 'password', 'confirm'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// TODO (tim backend): ganti dengan
// authService.registerPatient(email, password, displayName)  (PRD F-P01)
async function registerDemo(_name: string, _email: string, _password: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 3) {
    errors.name = 'Nama lengkap minimal 3 karakter.';
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Masukkan alamat email yang valid.';
  }
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (values.confirm !== values.password) {
    errors.confirm = 'Konfirmasi kata sandi tidak sama.';
  }
  return errors;
}

export default function RegisterScreen() {
  const c = useColors();
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const fieldRefs: Record<Field, RefObject<TextInput | null>> = {
    name: nameRef,
    email: emailRef,
    password: passwordRef,
    confirm: confirmRef,
  };

  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setValue = (field: Field, text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)/login');
  };

  const focusFirstError = (found: Errors) => {
    for (const field of FIELD_ORDER) {
      if (found[field]) {
        fieldRefs[field].current?.focus();
        return;
      }
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    setLoading(true);
    try {
      await registerDemo(values.name.trim(), values.email.trim(), values.password);
      router.replace('/(auth)/complete-profile');
    } catch {
      setFormError('Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Buat Akun Pasien"
      subtitle="Daftar untuk mengambil dan memantau antrean puskesmas dari HP Anda."
      step={{ current: 1, total: 2 }}
      onBack={goBack}
      error={formError}
    >
      <FormField
        ref={nameRef}
        label="Nama Lengkap"
        value={values.name}
        onChangeText={(text) => setValue('name', text)}
        error={errors.name}
        placeholder="Nama sesuai KTP"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!loading}
      />

      <FormField
        ref={emailRef}
        label="Email"
        value={values.email}
        onChangeText={(text) => setValue('email', text)}
        error={errors.email}
        placeholder="nama@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!loading}
      />

      <FormField
        ref={passwordRef}
        label="Kata Sandi"
        value={values.password}
        onChangeText={(text) => setValue('password', text)}
        error={errors.password}
        hint={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}
        placeholder="Buat kata sandi"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        editable={!loading}
      />

      <FormField
        ref={confirmRef}
        label="Konfirmasi Kata Sandi"
        value={values.confirm}
        onChangeText={(text) => setValue('confirm', text)}
        error={errors.confirm}
        placeholder="Ulangi kata sandi"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleRegister}
        editable={!loading}
      />

      <PrimaryButton label="Buat Akun" onPress={handleRegister} loading={loading} />

      <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: c.onSurfaceVariant }]}>Sudah punya akun?</Text>
        <TouchableOpacity onPress={goBack} style={styles.loginLink} accessibilityRole="link">
          <Text style={[styles.loginLinkText, { color: c.primary }]}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, marginVertical: 20 },
  loginRow: { alignSelf: 'stretch' },
  loginText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: { alignSelf: 'stretch', minHeight: 44, justifyContent: 'center' },
  loginLinkText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
