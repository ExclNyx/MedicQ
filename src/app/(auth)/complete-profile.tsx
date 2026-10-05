import { useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthScreen } from '../../components/ui/AuthScreen';
import { DatePickerField } from '../../components/ui/DatePickerField';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useColors } from '../../core/theme/ThemeContext';
import type { Gender } from '../../core/models';
import { scanKtpFromImage } from '../../services/ktp-ocr.service';

type Field = 'nik' | 'fullName' | 'dob' | 'gender' | 'address' | 'phone';
type Values = { nik: string; fullName: string; dob: string; address: string; phone: string };
type Errors = Partial<Record<Field, string>>;
type ScanState = 'idle' | 'processing' | 'filled' | 'error';

/** Field TextInput yang bisa di-focus via keyboard (TTL pakai kalender, bukan keyboard). */
const TEXT_FIELDS: Exclude<Field, 'gender' | 'dob'>[] = ['nik', 'fullName', 'address', 'phone'];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

/** Ubah "DD-MM-YYYY" menjadi Date; null kalau tanggalnya tidak valid. */
function parseDob(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate || year < 1900 || date > new Date()) return null;
  return date;
}

function validate(values: Values, gender: Gender | null): Errors {
  const errors: Errors = {};
  if (!/^\d{16}$/.test(values.nik)) {
    errors.nik = 'NIK harus 16 digit angka.';
  }
  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Isi nama lengkap sesuai KTP.';
  }
  if (!parseDob(values.dob)) {
    errors.dob = 'Tanggal lahir belum dipilih.';
  }
  if (!gender) {
    errors.gender = 'Pilih jenis kelamin.';
  }
  if (values.address.trim().length < 5) {
    errors.address = 'Isi alamat dengan lengkap.';
  }
  if (!/^(\+62|62|0)8\d{8,11}$/.test(values.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Nomor HP tidak valid. Contoh: 081234567890.';
  }
  return errors;
}

// TODO (tim backend): ganti dengan patientService.createOrUpdateProfile(uid, {
//   nik, fullName, dateOfBirth (Date dari parseDob), gender, address, phoneNumber })  (PRD F-P02)
async function saveProfileDemo(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3],
};

export default function CompleteProfileScreen() {
  const c = useColors();
  const nikRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const fieldRefs: Record<Exclude<Field, 'gender' | 'dob'>, RefObject<TextInput | null>> = {
    nik: nikRef,
    fullName: nameRef,
    address: addressRef,
    phone: phoneRef,
  };

  const [values, setValues] = useState<Values>({
    nik: '',
    fullName: '',
    dob: '',
    address: '',
    phone: '',
  });
  const [gender, setGender] = useState<Gender | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanError, setScanError] = useState<string | null>(null);

  const setValue = (field: keyof Values, text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handleDobChange = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    setValue('dob', `${d}-${m}-${date.getFullYear()}`);
  };

  const focusFirstError = (found: Errors) => {
    for (const field of TEXT_FIELDS) {
      if (found[field]) {
        fieldRefs[field].current?.focus();
        return;
      }
    }
  };

  const handleScanKtp = async (source: 'camera' | 'library') => {
    if (loading || scanState === 'processing') return;
    setFormError(null);

    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setScanState('error');
          setScanError(
            'Izin kamera diperlukan untuk memindai KTP. Anda bisa pilih foto dari galeri atau isi manual.'
          );
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setScanState('error');
          setScanError('Izin foto diperlukan untuk memilih gambar KTP. Silakan isi manual.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

      if (result.canceled || !result.assets?.[0]) return;

      setScanState('processing');
      const scan = await scanKtpFromImage(result.assets[0].uri);

      setValues((prev) => ({
        ...prev,
        nik: scan.nik,
        fullName: scan.fullName,
        dob: scan.dob || prev.dob,
        address: scan.address || prev.address,
      }));
      if (scan.gender) setGender(scan.gender);
      setErrors((prev) => ({
        ...prev,
        nik: undefined,
        fullName: undefined,
        dob: undefined,
        gender: undefined,
        address: undefined,
      }));
      setScanState('filled');
      setScanError(null);
    } catch {
      setScanState('error');
      setScanError('Gagal membaca KTP. Coba foto yang lebih jelas, atau isi manual.');
    }
  };

  const handleSubmit = async () => {
    if (loading || scanState === 'processing') return;

    const found = validate(values, gender);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    setLoading(true);
    try {
      await saveProfileDemo();
      router.replace('/(patient)/home');
    } catch {
      setFormError('Data gagal disimpan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const scanBusy = scanState === 'processing' || loading;
  const scanButtonColors = [c.primaryLight, c.primary, c.primaryDeep] as const;

  return (
    <AuthScreen
      title="Lengkapi Data Diri"
      subtitle="Data ini dipakai petugas untuk memverifikasi identitas Anda."
      step={{ current: 2, total: 2 }}
      error={formError}
    >
      {/* Scan KTP — isi otomatis, pendaftar koreksi bila ada yang salah */}
      <View
        style={[
          styles.scanCard,
          {
            backgroundColor: c.surfaceSoft,
            borderColor: c.cardBorder,
            borderLeftColor: c.primary,
            shadowColor: c.primaryDeep,
          },
        ]}
      >
        <Text style={[styles.scanTitle, { color: c.onSurface }]}>Scan KTP</Text>
        <Text style={[styles.scanHelper, { color: c.onSurfaceVariant }]}>
          Isi otomatis dari foto KTP. Periksa kembali sebelum menyimpan.
        </Text>

        {scanState === 'filled' && (
          <View
            style={[styles.scanSuccess, { backgroundColor: c.successBg, borderColor: c.success }]}
            accessibilityRole="alert"
          >
            <Text style={[styles.scanSuccessText, { color: c.success }]}>
              Data terisi dari scan KTP — periksa kembali.
            </Text>
          </View>
        )}
        {scanState === 'error' && scanError ? (
          <View
            style={[styles.scanErrorBox, { backgroundColor: c.errorContainer, borderColor: c.error }]}
            accessibilityRole="alert"
          >
            <Text style={[styles.scanErrorText, { color: c.error }]}>{scanError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.scanButton, scanBusy && styles.scanButtonDisabled, { shadowColor: c.primaryDeep }]}
          onPress={() => handleScanKtp('camera')}
          disabled={scanBusy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ambil foto KTP dengan kamera"
          accessibilityState={{ disabled: scanBusy, busy: scanState === 'processing' }}
        >
          <LinearGradient
            colors={scanButtonColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scanButtonGradient}
          >
            {scanState === 'processing' ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <View style={styles.scanButtonInner}>
                <Ionicons name="camera-outline" size={18} color={c.onPrimary} />
                <Text style={[styles.scanButtonText, { color: c.onPrimary }]}>Ambil Foto KTP</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanLink}
          onPress={() => handleScanKtp('library')}
          disabled={scanBusy}
          accessibilityRole="button"
          accessibilityLabel="Pilih foto KTP dari galeri"
        >
          <Text style={[styles.scanLinkText, { color: c.primary }]}>Pilih dari galeri</Text>
        </TouchableOpacity>
      </View>

      <FormField
        ref={nikRef}
        label="NIK"
        value={values.nik}
        onChangeText={(text) => setValue('nik', text.replace(/\D/g, ''))}
        error={errors.nik}
        hint="16 digit, sesuai KTP."
        placeholder="3374xxxxxxxxxxxx"
        keyboardType="number-pad"
        maxLength={16}
        returnKeyType="next"
        onSubmitEditing={() => nameRef.current?.focus()}
        editable={!loading}
      />

      <FormField
        ref={nameRef}
        label="Nama Lengkap"
        value={values.fullName}
        onChangeText={(text) => setValue('fullName', text)}
        error={errors.fullName}
        hint="Sesuai KTP."
        placeholder="Nama lengkap"
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => addressRef.current?.focus()}
        editable={!loading}
      />

      <DatePickerField
        label="Tanggal Lahir"
        value={values.dob}
        onChange={handleDobChange}
        error={errors.dob}
        hint="Ketuk untuk memilih tanggal sesuai KTP."
        disabled={loading || scanState === 'processing'}
      />

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: c.onSurfaceVariant }]}>Jenis Kelamin</Text>
        <View style={styles.genderRow} accessibilityRole="radiogroup">
          {GENDER_OPTIONS.map((option) => {
            const selected = gender === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  {
                    backgroundColor: c.surface,
                    borderColor: selected ? c.primary : c.outlineVariant,
                  },
                  selected && { backgroundColor: c.primaryContainer },
                ]}
                onPress={() => {
                  setGender(option.value);
                  setErrors((prev) => ({ ...prev, gender: undefined }));
                }}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
              >
                <View style={styles.genderRowInner}>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: selected ? c.primary : c.outline },
                    ]}
                  >
                    {selected ? <View style={[styles.radioDot, { backgroundColor: c.primary }]} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      { color: selected ? c.onPrimaryContainer : c.onSurfaceVariant },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.gender ? (
          <Text style={[styles.groupError, { color: c.error }]}>{errors.gender}</Text>
        ) : null}
      </View>

      <FormField
        ref={addressRef}
        label="Alamat"
        value={values.address}
        onChangeText={(text) => setValue('address', text)}
        error={errors.address}
        placeholder="Jalan, RT/RW, kelurahan, kecamatan"
        multiline
        autoCapitalize="sentences"
        editable={!loading}
      />

      <FormField
        ref={phoneRef}
        label="Nomor HP"
        value={values.phone}
        onChangeText={(text) => setValue('phone', text)}
        error={errors.phone}
        placeholder="081234567890"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!loading}
      />

      <PrimaryButton label="Simpan Data Diri" onPress={handleSubmit} loading={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  scanCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scanTitle: { fontSize: 15, fontWeight: '700' },
  scanHelper: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 12,
  },
  scanSuccess: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  scanSuccessText: { fontSize: 12, fontWeight: '600' },
  scanErrorBox: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  scanErrorText: { fontSize: 12, fontWeight: '600' },
  scanButton: {
    minHeight: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  scanButtonGradient: {
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonDisabled: { opacity: 0.7 },
  scanButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanButtonText: { fontSize: 15, fontWeight: '700' },
  scanLink: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  scanLinkText: { fontSize: 13, fontWeight: '700' },

  group: { marginBottom: 16 },
  groupLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  groupError: { fontSize: 12, marginTop: 6 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  genderRowInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  genderText: { fontSize: 14, fontWeight: '600' },
});
