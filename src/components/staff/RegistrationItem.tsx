import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RegistrationModel } from '../../core/models';
import { Colors } from '../../core/constants/colors';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Props {
  registration: RegistrationModel;
  onVerify: (registration: RegistrationModel) => void;
}

export const RegistrationItem: React.FC<Props> = ({ registration, onVerify }) => {
  const timeStr = registration.createdAt
    ? format(new Date(registration.createdAt), 'HH:mm', { locale: localeId })
    : '-';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{registration.patientName}</Text>
          <Text style={styles.meta}>
            {registration.isManual ? '📋 Manual' : '📱 Aplikasi'} • {timeStr}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onVerify(registration)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>VERIFIKASI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  meta: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: Colors.onPrimary, fontSize: 12, fontWeight: '700' },
});
