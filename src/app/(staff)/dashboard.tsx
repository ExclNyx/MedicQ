import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';
import { RegistrationItem } from '../../components/staff/RegistrationItem';
import { QueueListItem } from '../../components/staff/QueueListItem';

export default function StaffDashboardScreen() {
  const [tab, setTab] = useState<'registrations' | 'queues'>('registrations');
  const [serviceId, setServiceId] = useState('poli_umum');

  // DUMMY DATA FOR UI TESTING
  const services = [
    { id: 'poli_umum', name: 'Poli Umum' },
    { id: 'poli_gigi', name: 'Poli Gigi' },
    { id: 'kia', name: 'KIA' },
  ];

  const pendingRegistrations = [
    { id: 'r1', patientName: 'Budi Santoso', isManual: false, createdAt: new Date() },
    { id: 'r2', patientName: 'Siti Aminah', isManual: true, createdAt: new Date(Date.now() - 15 * 60000) },
  ];

  const verifiedRegistrations = [
    { id: 'r3', patientName: 'Ahmad Dahlan', isManual: false, createdAt: new Date(Date.now() - 30 * 60000) },
  ];

  const currentServing = {
    id: 'q1', queueNumber: 'A-025', status: 'SERVING', patientName: 'Asep Suparman'
  };

  const waitingQueues = [
    { id: 'q2', queueNumber: 'A-026', status: 'WAITING', patientName: 'Ratna Sari' },
    { id: 'q3', queueNumber: 'A-027', status: 'WAITING', patientName: 'Andi' },
    { id: 'q4', queueNumber: 'A-028', status: 'WAITING', patientName: 'Bambang' },
  ];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'registrations' && styles.tabActive]} onPress={() => setTab('registrations')}>
          <Text style={[styles.tabText, tab === 'registrations' && styles.tabTextActive]}>
            Verifikasi (2)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'queues' && styles.tabActive]} onPress={() => setTab('queues')}>
          <Text style={[styles.tabText, tab === 'queues' && styles.tabTextActive]}>
            Antrean Poli
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'registrations' ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Menunggu Verifikasi</Text>
              <TouchableOpacity style={styles.manualBtn} onPress={() => router.push('/(staff)/manual-register')}>
                <Text style={styles.manualBtnText}>+ Pasien Manual</Text>
              </TouchableOpacity>
            </View>

            {pendingRegistrations.map((reg) => (
              <RegistrationItem
                key={reg.id}
                registration={reg as any}
                onVerify={() => router.push('/(staff)/patient-detail')}
              />
            ))}
            
            <View style={{ height: 24 }} />
            <Text style={styles.sectionTitle}>Menunggu Pilih Poli (Sudah Diverifikasi)</Text>
            {verifiedRegistrations.map((reg) => (
              <RegistrationItem
                key={reg.id}
                registration={reg as any}
                onVerify={() => router.push('/(staff)/complaint-form')}
              />
            ))}
          </View>
        ) : (
          <View>
            {/* Service selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceBar}>
              {services.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.serviceChip, serviceId === s.id && styles.serviceChipActive]}
                  onPress={() => setServiceId(s.id)}
                >
                  <Text style={[styles.serviceChipText, serviceId === s.id && styles.serviceChipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Active Serving Panel */}
            <View style={styles.activePanel}>
              <Text style={styles.panelLabel}>Sedang Dilayani</Text>
              <Text style={styles.panelNumber}>{currentServing.queueNumber}</Text>
              <Text style={styles.panelName}>{currentServing.patientName}</Text>
              
              <TouchableOpacity style={styles.callBtn}>
                <Text style={styles.callBtnText}>PANGGIL BERIKUTNYA (A-026)</Text>
              </TouchableOpacity>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.primary }]}>
                  <Text style={[styles.actionText, { color: Colors.primary }]}>Panggil Ulang</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.secondary, borderColor: Colors.secondary }]}>
                  <Text style={[styles.actionText, { color: Colors.onSecondary }]}>Selesai</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Daftar Tunggu ({waitingQueues.length})</Text>
            {waitingQueues.map((q) => (
              <QueueListItem key={q.id} queue={q as any} onSkip={() => {}} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, elevation: 2 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontWeight: '600', color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary },
  scroll: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 16 },
  manualBtn: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  manualBtnText: { color: Colors.onPrimaryContainer, fontSize: 12, fontWeight: '600' },
  
  serviceBar: { flexDirection: 'row', marginBottom: 20 },
  serviceChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, marginRight: 8, borderWidth: 1, borderColor: Colors.outlineVariant },
  serviceChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  serviceChipText: { color: Colors.onSurfaceVariant, fontWeight: '600', fontSize: 13 },
  serviceChipTextActive: { color: Colors.onPrimary },
  
  activePanel: { backgroundColor: Colors.surface, padding: 24, borderRadius: 16, alignItems: 'center', elevation: 2, marginBottom: 24 },
  panelLabel: { fontSize: 14, color: Colors.onSurfaceVariant },
  panelNumber: { fontSize: 48, fontWeight: '800', color: Colors.primary, marginVertical: 8 },
  panelName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface, marginBottom: 16 },
  callBtn: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 50, width: '100%', alignItems: 'center', marginTop: 12 },
  callBtnText: { color: Colors.onPrimary, fontWeight: '800', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  actionText: { fontWeight: '700' },
});
