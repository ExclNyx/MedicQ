import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../core/constants/colors';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function QueueStatusScreen() {
  const dummyQueue = {
    id: '1', queueNumber: 'A-027', status: 'WAITING' as const, 
    serviceName: 'Poli Umum', patientName: 'Andi'
  };

  const waitingList = [
    { id: 'q1', queueNumber: 'A-025', status: 'SERVING' as const },
    { id: 'q2', queueNumber: 'A-026', status: 'WAITING' as const },
    { id: '1', queueNumber: 'A-027', status: 'WAITING' as const },
    { id: 'q4', queueNumber: 'A-028', status: 'WAITING' as const },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.label}>Nomor Anda</Text>
        <Text style={styles.number}>{dummyQueue.queueNumber}</Text>
        <StatusBadge status={dummyQueue.status} />
        <View style={styles.divider} />
        <Text style={styles.detail}>Poli: {dummyQueue.serviceName}</Text>
        <Text style={styles.detail}>Pasien: {dummyQueue.patientName}</Text>
      </View>

      <Text style={styles.title}>Daftar Antrean ({dummyQueue.serviceName})</Text>
      <View style={styles.list}>
        {waitingList.map((q) => {
          const isMe = q.id === dummyQueue.id;
          return (
            <View key={q.id} style={[styles.item, isMe && styles.itemMe]}>
              <Text style={[styles.itemNumber, isMe && styles.itemNumberMe]}>
                {q.queueNumber}
              </Text>
              <StatusBadge status={q.status} size="sm" />
              {isMe && <Text style={styles.badgeMe}>Anda</Text>}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  card: { backgroundColor: Colors.surface, padding: 24, borderRadius: 16, marginBottom: 24, alignItems: 'center', elevation: 2 },
  label: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 8 },
  number: { fontSize: 40, fontWeight: '800', color: Colors.primary, marginBottom: 12 },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, width: '100%', marginVertical: 16 },
  detail: { fontSize: 14, color: Colors.onSurface, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 16, marginLeft: 4 },
  list: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', elevation: 1 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant },
  itemMe: { backgroundColor: Colors.primaryContainer },
  itemNumber: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, width: 80 },
  itemNumberMe: { color: Colors.primary },
  badgeMe: { marginLeft: 'auto', fontSize: 12, fontWeight: '700', color: Colors.primary },
});
