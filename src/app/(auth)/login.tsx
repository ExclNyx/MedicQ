import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthScreen } from "../../components/ui/AuthScreen";
import { FormField } from "../../components/ui/FormField";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import type { UserRole } from "../../core/models";
import { useColors } from "../../core/theme/ThemeContext";

// PRD: pasien & petugas masuk lewat form yang sama (F-P01, F-ST01).
// Peran ditentukan dari data akun di Firestore, bukan dipilih di layar ini.
type LoginRole = Extract<UserRole, "patient" | "staff">;

const HOME_BY_ROLE = {
  patient: "/(patient)/home",
  staff: "/(staff)/dashboard",
} as const satisfies Record<LoginRole, string>;

// TODO (tim backend): ganti dengan authService.signInWithEmail(email, password),
// lalu arahkan berdasarkan user.role hasil dari Firestore.
// Sementara mode demo: email yang diawali "petugas" dianggap petugas,
// selain itu dianggap pasien.
async function signInDemo(
  email: string,
  _password: string,
): Promise<LoginRole> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return email.trim().toLowerCase().startsWith("petugas") ? "staff" : "patient";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Field = "email" | "password";
type Errors = Partial<Record<Field, string>>;

function validate(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Masukkan alamat email yang valid.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  return errors;
}

export default function LoginScreen() {
  const c = useColors();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: Field, text: string) => {
    if (field === "email") setEmail(text);
    else setPassword(text);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleLogin = async () => {
    if (loading) return;

    const found = validate(email, password);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const role = await signInDemo(email, password);
      router.replace(HOME_BY_ROLE[role]);
    } catch {
      setFormError("Email atau kata sandi salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      brand={{
        name: "MedicQueue",
        tagline: "Sistem Antrean Digital Puskesmas",
      }}
      title="Masuk"
      subtitle="Pasien dan petugas masuk dari sini. Peran Anda dikenali otomatis dari akun."
      error={formError}
    >
      <FormField
        label="Email"
        value={email}
        onChangeText={(text) => setField("email", text)}
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
        value={password}
        onChangeText={(text) => setField("password", text)}
        error={errors.password}
        hint={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}
        placeholder="Masukkan kata sandi"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        editable={!loading}
      />

      <PrimaryButton label="Masuk" onPress={handleLogin} loading={loading} />

      <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

      <View style={styles.registerRow}>
        <Text style={[styles.registerText, { color: c.onSurfaceVariant }]}>
          Belum punya akun?
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={styles.registerLink}
          accessibilityRole="link"
        >
          <Text style={[styles.registerLinkText, { color: c.primary }]}>
            Daftar sebagai pasien
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hanya tampil saat development. Layar TV dibuka langsung di /display (PRD Alur C). */}
      {__DEV__ && (
        <TouchableOpacity
          onPress={() => router.push("/display")}
          style={styles.devLink}
          accessibilityRole="link"
        >
          <Text style={[styles.devLinkText, { color: c.outline }]}>
            [Dev] Buka Display Board TV
          </Text>
        </TouchableOpacity>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, marginVertical: 20 },
  registerRow: { alignSelf: "stretch" },
  registerText: {
    alignSelf: "stretch",
    textAlign: "center",
    fontSize: 14,
  },
  registerLink: {
    alignSelf: "stretch",
    minHeight: 44,
    justifyContent: "center",
  },
  registerLinkText: {
    alignSelf: "stretch",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },

  // Dev only
  devLink: { alignItems: "center", paddingVertical: 16 },
  // stretch + center: cegah teks terpotong di tepi kanan (Android)
  devLinkText: { fontSize: 12, alignSelf: "stretch", textAlign: "center" },
});
