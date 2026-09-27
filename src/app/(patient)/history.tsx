import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../core/constants/colors';

export default function HistoryScreen() {
  const history = [
    { id: '1', visitDate: '2026-10-10', status: 'COMPLETED', serviceName: 'Poli Umum', complaints: ['Demam', 'Pusing'] },
    { id: '2', visitDate: '2026-09-01', status: 'COMPLETED', serviceName: 'Poli Gigi', complaints: ['Sakit Gigi'] },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.date}>{item.visitDate}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.label}>Poli Tujuan:</Text>
              <Text style={styles.value}>{item.serviceName}</Text>
              <Text style={styles.label}>Keluhan:</Text>
              <Text style={styles.value}>{item.complaints.join(', ')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant, paddingBottom: 12, marginBottom: 12 },
  date: { fontWeight: '700', color: Colors.onSurface },
  status: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  content: { gap: 4 },
  label: { fontSize: 12, color: Colors.onSurfaceVariant },
  value: { fontSize: 14, color: Colors.onSurface, marginBottom: 8, fontWeight: '500' },
});
