import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { RegistrationModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';

interface Props {
  registration: RegistrationModel;
  onVerify: (registration: RegistrationModel) => void;
  actionLabel?: string;
}

/** Kartu daftar registrasi di dashboard petugas. */
export function RegistrationItem({
  registration,
  onVerify,
  actionLabel = 'VERIFIKASI',
}: Props) {
  const c = useColors();
  const timeStr = registration.createdAt
    ? format(new Date(registration.createdAt), 'HH:mm', { locale: localeId })
    : '-';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.cardBorder, shadowColor: c.primaryDeep },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: registration.isManual ? c.surfaceSoft : c.primaryContainer },
        ]}
      >
        <Ionicons
          name={registration.isManual ? 'document-text-outline' : 'phone-portrait-outline'}
          size={20}
          color={registration.isManual ? c.onSurfaceVariant : c.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: c.onSurface }]} numberOfLines={1}>
          {registration.patientName}
        </Text>
        <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
          {registration.isManual ? 'Manual' : 'Aplikasi'} · {timeStr}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.primary }]}
        onPress={() => onVerify(registration)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${registration.patientName}`}
      >
        <Text style={[styles.btnText, { color: c.onPrimary }]}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  meta: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});
