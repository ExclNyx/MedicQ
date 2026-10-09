import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DisplayBoard } from '../../components/display/DisplayBoard';
import type { QueueModel, ServiceModel } from '../../core/models';
import { useStaffQueue } from '../../hooks/useStaffQueue';
import { useLocalSearchParams } from 'expo-router';

/** Layar TV ruang tunggu — buka di browser/TV via /display. */
export default function DisplayScreen() {
  const { serviceId } = useLocalSearchParams();
  const id = (serviceId as string) || 'poli_umum';

  const { services, currentServing, waitingQueues } = useStaffQueue(id);
  const displayService = services.find(s => s.id === id);

  return (
    <View style={styles.container}>
      <DisplayBoard
        service={displayService || null}
        currentQueue={currentServing || null}
        nextQueues={waitingQueues}
      />

      {/* Tombol keluar — hanya untuk UI testing, sembunyikan di production TV */}
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => router.replace('/(auth)/login')}
        accessibilityRole="button"
        accessibilityLabel="Keluar mode TV"
      >
        <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
        <Text style={styles.exitText}>Keluar Mode TV</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D47A1' },
  exitBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    zIndex: 100,
  },
  exitText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '700',
  },
});
