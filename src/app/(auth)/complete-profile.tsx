import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { AuthScreen } from '../../components/ui/AuthScreen';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../core/constants/colors';
import type { Gender } from '../../core/models';

type Field = 'nik' | 'fullName' | 'dob' | 'gender' | 'address' | 'phone';
type Values = { nik: string; fullName: string; dob: string; address: string; phone: string };
type Errors = Partial<Record<Field, string>>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

/** Rapikan ketikan jadi DD-MM-YYYY (tanda "-" ditambah otomatis). */
function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('-');
}

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
    errors.dob = 'Tanggal lahir tidak valid. Contoh: 17-08-1990.';
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

export default function CompleteProfileScreen() {
  const nameRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);

  const [values, setValues] = useState<Values>({
    nik: '',
    fullName: '',
    dob: '',
    address: '',
    phone: '',
  });
  const [gender, setGender] = useState<Gender | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const setValue = (field: keyof Values, text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    const found = validate(values, gender);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await saveProfileDemo();
      // Alur PRD A: setelah data lengkap, pasien masuk ke Beranda.
      router.replace('/(patient)/home');
    } catch {
      setErrors({ nik: 'Data gagal disimpan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Lengkapi Data Diri"
      subtitle="Data ini dipakai petugas untuk memverifikasi identitas Anda."
      step={{ current: 2, total: 2 }}
    >
      <FormField
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
        onSubmitEditing={() => dobRef.current?.focus()}
        editable={!loading}
      />

      <FormField
        ref={dobRef}
        label="Tanggal Lahir"
        value={values.dob}
        onChangeText={(text) => setValue('dob', formatDobInput(text))}
        error={errors.dob}
        hint="Format: DD-MM-YYYY."
        placeholder="17-08-1990"
        keyboardType="number-pad"
        maxLength={10}
        editable={!loading}
      />

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Jenis Kelamin</Text>
        <View style={styles.genderRow} accessibilityRole="radiogroup">
          {GENDER_OPTIONS.map((option) => {
            const selected = gender === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.genderOption, selected && styles.genderOptionSelected]}
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
                <Text style={[styles.genderText, selected && styles.genderTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.gender ? <Text style={styles.groupError}>{errors.gender}</Text> : null}
      </View>

      <FormField
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
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  groupError: { fontSize: 12, color: Colors.error, marginTop: 6 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  genderOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  genderText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  genderTextSelected: { color: Colors.onPrimaryContainer },
});
