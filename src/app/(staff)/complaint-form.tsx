import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { FormField } from '../../components/ui/FormField';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { COMPLAINT_OPTIONS } from '../../core/constants/complaints';
import { DEFAULT_SERVICES } from '../../core/constants/services';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { registrationService } from '../../services/registration.service';
import { queueService } from '../../services/queue.service';
import { useQueueStore } from '../../stores/queue.store';

export default function ComplaintFormScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { regId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { verifiedRegistrations } = useQueueStore();

  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleComplaint = (label: string) => {
    setSelectedComplaints((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      setError('Pilih poli tujuan terlebih dahulu.');
      return;
    }
    setError(null);
    if (!regId || typeof regId !== 'string' || !user?.uid) return;

    const svc = DEFAULT_SERVICES.find((s) => s.id === selectedService);
    if (!svc) return;

    setLoading(true);
    try {
      await registrationService.updateComplaints({
        registrationId: regId,
        staffId: user.uid,
        complaints: selectedComplaints,
        complaintNote: note
      });

      const reg = verifiedRegistrations.find(r => r.id === regId);
      if (!reg) throw new Error('Registrasi tidak ditemukan di state lokal.');

      const queue = await queueService.assignQueue({
        registrationId: reg.id,
        patientId: reg.patientId,
        patientName: reg.patientName,
        serviceId: svc.id,
        serviceName: svc.name,
      });

      Alert.alert(
        'Nomor Antrean Dibuat',
        `Pasien masuk ke ${svc.name}.\n\nNomor Antrean: ${queue.queueNumber}`,
        [{ text: 'Ke Dashboard', onPress: () => router.navigate('/(staff)/dashboard') }],
      );
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
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
          <StaffHeader title="Keluhan & Poli" subtitle="Pencatatan sebelum nomor antrean" />

          <View style={styles.body}>
            {/* Keluhan */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>
              Pencatatan Keluhan
            </Text>
            <Text style={[styles.cardDesc, { color: c.onSurfaceVariant }]}>
              Pilih keluhan yang sesuai, atau tambahkan catatan khusus.
            </Text>

            <View style={styles.chipGrid}>
              {COMPLAINT_OPTIONS.map((opt) => {
                const active = selectedComplaints.includes(opt.label);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.primaryContainer : c.surfaceSoft,
                        borderColor: active ? c.primary : c.outlineVariant,
                      },
                    ]}
                    onPress={() => toggleComplaint(opt.label)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                  >
                    <Text style={styles.chipEmoji}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? c.onPrimaryContainer : c.onSurfaceVariant },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormField
              label="Catatan khusus (opsional)"
              value={note}
              onChangeText={setNote}
              placeholder="Mis. demam sejak 2 hari lalu…"
              multiline
            />
          </View>

          {/* Poli tujuan */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>
              Poli Tujuan <Text style={{ color: c.error }}>*</Text>
            </Text>
            <Text style={[styles.cardDesc, { color: c.onSurfaceVariant }]}>
              Nomor antrean mengikuti kode poli (mis. A-029 untuk Poli Umum).
            </Text>

            <View accessibilityRole="radiogroup">
              {DEFAULT_SERVICES.map((svc) => {
                const active = selectedService === svc.id;
                return (
                  <TouchableOpacity
                    key={svc.id}
                    style={[
                      styles.radioItem,
                      {
                        backgroundColor: active ? c.primaryContainer : c.surface,
                        borderColor: active ? c.primary : c.outlineVariant,
                      },
                    ]}
                    onPress={() => {
                      setSelectedService(svc.id);
                      setError(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: active ? c.primary : c.outlineVariant },
                      ]}
                    >
                      {active ? (
                        <View style={[styles.radioInner, { backgroundColor: c.primary }]} />
                      ) : null}
                    </View>
                    <View style={styles.flex}>
                      <Text
                        style={[
                          styles.radioText,
                          { color: active ? c.onPrimaryContainer : c.onSurface },
                        ]}
                      >
                        {svc.name}
                      </Text>
                      <Text
                        style={[
                          styles.radioSub,
                          { color: active ? c.onPrimaryContainer : c.onSurfaceVariant },
                        ]}
                      >
                        Kode {svc.code} · {svc.description}
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: c.errorContainer, borderColor: c.error },
                ]}
                accessibilityRole="alert"
              >
                <Ionicons name="alert-circle-outline" size={16} color={c.error} />
                <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
              </View>
            ) : null}
          </View>

            <PrimaryButton label="BUAT NOMOR ANTREAN" onPress={handleSubmit} loading={loading} />
            <OutlineButton
              label="Kembali"
              icon="chevron-back"
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

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  chipEmoji: { fontSize: 14 },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    flexShrink: 1,
  },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: 10,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  radioSub: { fontSize: 11, marginTop: 1, lineHeight: 15 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  errorText: { fontSize: 13, fontWeight: '600', flex: 1 },
});
