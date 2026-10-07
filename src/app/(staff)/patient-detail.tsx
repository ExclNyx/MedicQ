import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { useColors } from '../../core/theme/ThemeContext';

// DUMMY DATA — UI demo (diisi dari route params saat Firestore sudah siap)
const PATIENT = {
  nik: '3374123456789012',
  fullName: 'Budi Santoso',
  dateOfBirth: '10 Januari 1990',
  gender: 'Laki-laki',
  address: 'Jl. Merdeka No. 123, Semarang',
  phoneNumber: '081234567890',
  complaints: ['Demam', 'Batuk / Pilek'],
  complaintNote: 'Demam sejak 2 hari lalu',
  isManual: false,
};

const IDENTITY_ROWS: { label: string; value: string }[] = [
  { label: 'NIK', value: PATIENT.nik },
  { label: 'Nama Lengkap', value: PATIENT.fullName },
  { label: 'Tanggal Lahir', value: PATIENT.dateOfBirth },
  { label: 'Jenis Kelamin', value: PATIENT.gender },
  { label: 'Alamat', value: PATIENT.address },
  { label: 'No. HP', value: PATIENT.phoneNumber },
];

export default function PatientDetailScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const handleVerify = () => {
    Alert.alert('Identitas Terverifikasi', 'Lanjut pencatatan keluhan & penentuan poli.', [
      {
        text: 'Lanjut',
        onPress: () => router.push('/(staff)/complaint-form'),
      },
    ]);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <StaffHeader title="Verifikasi Pasien" subtitle="Cocokkan data diri dengan KTP" />

        <View style={styles.body}>
          {/* Ringkasan pasien */}
          <View
            style={[
              styles.card,
              styles.identityCard,
              {
                backgroundColor: c.surface,
                borderColor: c.cardBorder,
                shadowColor: c.primaryDeep,
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: c.primaryContainer }]}>
              <Ionicons name="person-outline" size={28} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.identityLabel, { color: c.onSurfaceVariant }]}>
                Nama Pasien
              </Text>
              <Text style={[styles.identityName, { color: c.onSurface }]}>
                {PATIENT.fullName}
              </Text>
              <View style={styles.tagRow}>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: PATIENT.isManual ? c.surfaceSoft : c.primaryContainer,
                    },
                  ]}
                >
                  <Ionicons
                    name={PATIENT.isManual ? 'document-text-outline' : 'phone-portrait-outline'}
                    size={12}
                    color={PATIENT.isManual ? c.onSurfaceVariant : c.primary}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      {
                        color: PATIENT.isManual ? c.onSurfaceVariant : c.onPrimaryContainer,
                      },
                    ]}
                  >
                    {PATIENT.isManual ? 'Registrasi Manual' : 'Melalui Aplikasi'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Data identitas */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>
              Data Identitas
            </Text>
            <Text style={[styles.cardDesc, { color: c.onSurfaceVariant }]}>
              Pastikan data sesuai kartu identitas sebelum memverifikasi.
            </Text>

            {IDENTITY_ROWS.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.row,
                  index < IDENTITY_ROWS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: c.outlineVariant,
                  },
                ]}
              >
                <Text style={[styles.rowLabel, { color: c.onSurfaceVariant }]}>
                  {row.label}
                </Text>
                <Text style={[styles.rowValue, { color: c.onSurface }]} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Keluhan pasien */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>
              Keluhan Dipilih Pasien
            </Text>
            <View style={styles.chipWrap}>
              {PATIENT.complaints.map((label) => (
                <View
                  key={label}
                  style={[styles.chip, { backgroundColor: c.primaryContainer }]}
                >
                  <Text style={[styles.chipText, { color: c.onPrimaryContainer }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            {PATIENT.complaintNote ? (
              <View
                style={[
                  styles.noteBox,
                  { backgroundColor: c.surfaceSoft, borderLeftColor: c.primary },
                ]}
              >
                <Ionicons name="document-text-outline" size={16} color={c.primary} />
                <Text style={[styles.noteText, { color: c.onSurfaceVariant }]}>
                  {PATIENT.complaintNote}
                </Text>
              </View>
            ) : null}
          </View>

          <PrimaryButton label="VERIFIKASI & LANJUT" onPress={handleVerify} />
          <OutlineButton
            label="Kembali"
            icon="chevron-back"
            tone="danger"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
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
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  identityLabel: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  identityName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    lineHeight: 26,
  },
  tagRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    flexShrink: 1,
  },

  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  cardDesc: { fontSize: 12, lineHeight: 16, marginTop: 4, marginBottom: 12 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 13, fontWeight: '500', lineHeight: 18, flexShrink: 0 },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'right',
    flex: 1,
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },

  noteBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
