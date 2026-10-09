import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerField } from '../../components/ui/DatePickerField';
import { FormField } from '../../components/ui/FormField';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StaffHeader } from '../../components/ui/StaffHeader';
import type { Gender } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';
import { patientService } from '../../services/patient.service';
import { registrationService } from '../../services/registration.service';

type Values = {
  nik: string;
  fullName: string;
  address: string;
  phone: string;
};

type Errors = Partial<Record<keyof Values | 'dob' | 'gender', string>>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

function formatDobId(value: string): string {
  // DatePickerField memakai format DD-MM-YYYY
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value || '');
  if (!match) return value;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3];
  if (month < 1 || month > 12) return value;
  return `${day} ${months[month - 1]} ${year}`;
}

export default function ManualRegisterScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const [searchNik, setSearchNik] = useState('');
  const [values, setValues] = useState<Values>({
    nik: '',
    fullName: '',
    address: '',
    phone: '',
  });
  const [dob, setDob] = useState(''); // DD-MM-YYYY
  const [gender, setGender] = useState<Gender | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setValue = (key: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSearch = async () => {
    if (!/^\d{16}$/.test(searchNik)) {
      Alert.alert('NIK tidak valid', 'Masukkan 16 digit angka NIK.');
      return;
    }
    try {
      const patient = await patientService.findByNik(searchNik);
      if (patient) {
        setValues({
          nik: patient.nik,
          fullName: patient.fullName,
          address: patient.address,
          phone: patient.phoneNumber,
        });
        setDob(`${patient.dateOfBirth.getDate().toString().padStart(2, '0')}-${(patient.dateOfBirth.getMonth()+1).toString().padStart(2, '0')}-${patient.dateOfBirth.getFullYear()}`);
        setGender(patient.gender);
        Alert.alert('Ditemukan', `Data pasien ${patient.fullName} berhasil dimuat.`);
      } else {
        Alert.alert('Tidak Ditemukan', 'Pasien dengan NIK tersebut belum terdaftar.');
      }
    } catch (e: any) {
      Alert.alert('Gagal mencari', e.message);
    }
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (!/^\d{16}$/.test(values.nik)) found.nik = 'NIK harus 16 digit angka.';
    if (values.fullName.trim().length < 3) found.fullName = 'Isi nama lengkap pasien.';
    if (!dob) found.dob = 'Tanggal lahir belum dipilih.';
    if (!gender) found.gender = 'Pilih jenis kelamin.';
    if (values.address.trim().length < 5) found.address = 'Isi alamat dengan lengkap.';
    return found;
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    try {
      const patientId = values.nik; // Use NIK as patientId for manual offline patients
      const [d, m, y] = dob.split('-');
      
      await patientService.createOrUpdateProfile(patientId, {
        nik: values.nik,
        fullName: values.fullName,
        dateOfBirth: new Date(Number(y), Number(m)-1, Number(d)),
        gender: gender!,
        address: values.address,
        phoneNumber: values.phone
      });

      await registrationService.createRegistration({
        patientId,
        patientName: values.fullName,
        isManual: true
      });

      Alert.alert(
        'Berhasil',
        `Pasien ${values.fullName} berhasil didaftarkan secara manual.`,
        [{ text: 'Ke Dashboard', onPress: () => router.navigate('/(staff)/dashboard') }]
      );
    } catch (e: any) {
      setFormError(e.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StaffHeader
            title="Registrasi Manual"
            subtitle="Untuk pasien yang tidak memakai aplikasi"
          />

          <View style={styles.body}>
            {formError ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: c.errorContainer, borderColor: c.error },
                ]}
                accessibilityRole="alert"
              >
                <Ionicons name="alert-circle-outline" size={16} color={c.error} />
                <Text style={[styles.errorText, { color: c.error }]}>{formError}</Text>
              </View>
            ) : null}

            {/* Cari pasien lama */}
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.cardBorder },
              ]}
            >
              <Text style={[styles.cardTitle, { color: c.onSurface }]}>
                Pasien Lama
              </Text>
              <Text style={[styles.cardDesc, { color: c.onSurfaceVariant }]}>
                Cari berdasarkan NIK bila pasien sudah terdaftar sebelumnya.
              </Text>
              <FormField
                label="NIK"
                value={searchNik}
                onChangeText={setSearchNik}
                placeholder="16 digit NIK"
                keyboardType="numeric"
                maxLength={16}
              />
              <OutlineButton
                label="CARI PASIEN"
                icon="search-outline"
                onPress={handleSearch}
              />
            </View>

            {/* Form pasien baru */}
            <View
              style={[
                styles.card,
                { backgroundColor: c.surface, borderColor: c.cardBorder },
              ]}
            >
              <Text style={[styles.cardTitle, { color: c.onSurface }]}>
                Pasien Baru
              </Text>
              <Text style={[styles.cardDesc, { color: c.onSurfaceVariant }]}>
                Isi data diri sesuai KTP. Registrasi manual langsung masuk antrean
                setelah poli ditentukan.
              </Text>

              <FormField
                label="NIK *"
                value={values.nik}
                onChangeText={(t) => setValue('nik', t.replace(/\D/g, ''))}
                placeholder="16 digit angka"
                keyboardType="numeric"
                maxLength={16}
                error={errors.nik}
              />

              <FormField
                label="Nama Lengkap *"
                value={values.fullName}
                onChangeText={(t) => setValue('fullName', t)}
                placeholder="Sesuai KTP"
                error={errors.fullName}
              />

              <DatePickerField
                label="Tanggal Lahir *"
                value={dob}
                onChange={(date) => {
                  const pad = (n: number) => String(n).padStart(2, '0');
                  setDob(`${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`);
                  setErrors((prev) => ({ ...prev, dob: undefined }));
                }}
                error={errors.dob}
                hint={dob ? `Terpilih: ${formatDobId(dob)}` : undefined}
              />

              <View style={styles.group}>
                <Text style={[styles.groupLabel, { color: c.onSurfaceVariant }]}>
                  Jenis Kelamin *
                </Text>
                <View style={styles.genderRow} accessibilityRole="radiogroup">
                  {GENDER_OPTIONS.map((option) => {
                    const selected = gender === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.genderOption,
                          {
                            backgroundColor: selected ? c.primaryContainer : c.surface,
                            borderColor: selected ? c.primary : c.outlineVariant,
                          },
                        ]}
                        onPress={() => {
                          setGender(option.value);
                          setErrors((prev) => ({ ...prev, gender: undefined }));
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                      >
                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: selected ? c.primary : c.outlineVariant },
                          ]}
                        >
                          {selected ? (
                            <View
                              style={[styles.radioInner, { backgroundColor: c.primary }]}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.genderText,
                            {
                              color: selected ? c.onPrimaryContainer : c.onSurface,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.gender ? (
                  <Text style={[styles.groupError, { color: c.error }]}>
                    {errors.gender}
                  </Text>
                ) : null}
              </View>

              <FormField
                label="Alamat *"
                value={values.address}
                onChangeText={(t) => setValue('address', t)}
                placeholder="Jalan, nomor, kelurahan, kota"
                multiline
                error={errors.address}
              />

              <FormField
                label="No. HP (opsional)"
                value={values.phone}
                onChangeText={(t) => setValue('phone', t.replace(/[^\d+]/g, ''))}
                placeholder="08xxxxxxxxxx"
                keyboardType="phone-pad"
              />
            </View>

            <PrimaryButton
              label="SIMPAN & LANJUT KELUHAN"
              onPress={handleSubmit}
            />
            <OutlineButton
              label="Batal"
              icon="close"
              tone="danger"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
    gap: 16,
  },

  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  cardDesc: { fontSize: 12, lineHeight: 16, marginTop: 4, marginBottom: 14 },

  group: { marginBottom: 4 },
  groupLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  groupError: { fontSize: 12, marginTop: 6, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
  genderText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { fontSize: 13, fontWeight: '600', flex: 1 },
});
