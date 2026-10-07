import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DisplayBoard } from '../../components/display/DisplayBoard';
import type { QueueModel, ServiceModel } from '../../core/models';

// DUMMY DATA — UI demo TV (diganti Firestore listener saat backend siap, PRD F-D03)
const displayService: ServiceModel = {
  id: 'poli_umum',
  name: 'Poli Umum',
  code: 'A',
  isActive: true,
  currentServing: 'A-026',
  currentServingQueueId: 'q1',
};

const currentQueue: QueueModel = {
  id: 'q1',
  queueNumber: 'A-026',
  patientId: 'p2',
  patientName: 'Ratna Sari',
  serviceId: 'poli_umum',
  serviceName: 'Poli Umum',
  registrationId: 'r2',
  visitDate: format(new Date(), 'yyyy-MM-dd'),
  status: 'CALLED',
  sequenceNumber: 26,
  createdAt: new Date(),
  calledAt: new Date(),
  servedAt: null,
  completedAt: null,
};

const nextQueues: QueueModel[] = ['A-027', 'A-028', 'A-029', 'A-030', 'A-031'].map(
  (queueNumber, index) => ({
    id: `q${index + 2}`,
    queueNumber,
    patientId: `p${index + 3}`,
    patientName: `Pasien ${index + 3}`,
    serviceId: 'poli_umum',
    serviceName: 'Poli Umum',
    registrationId: `r${index + 3}`,
    visitDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'WAITING' as const,
    sequenceNumber: 27 + index,
    createdAt: new Date(),
    calledAt: null,
    servedAt: null,
    completedAt: null,
  }),
);

/** Layar TV ruang tunggu — buka di browser/TV via /display. */
export default function DisplayScreen() {
  return (
    <View style={styles.container}>
      <DisplayBoard
        service={displayService}
        currentQueue={currentQueue}
        nextQueues={nextQueues}
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
