import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';
import { QueueCard } from '../../components/ui/QueueCard';

type UiState = 'idle' | 'pending' | 'verified' | 'queued' | 'called';

export default function PatientHomeScreen() {
  const [uiState, setUiState] = useState<UiState>('queued');

  const dummyQueue = {
    id: '1', queueNumber: 'A-027', status: uiState === 'called' ? 'CALLED' : 'WAITING',
    serviceName: 'Poli Umum', patientName: 'Andi', patientId: '1', registrationId: '1',
    serviceId: 'poli_umum', visitDate: '2026-10-10', sequenceNumber: 27, createdAt: new Date(),
    calledAt: null, servedAt: null, completedAt: null
  };

  const currentServing = {
    id: '2', queueNumber: 'A-025', status: 'SERVING',
    serviceName: 'Poli Umum', patientName: 'Budi', patientId: '2', registrationId: '2',
    serviceId: 'poli_umum', visitDate: '2026-10-10', sequenceNumber: 25, createdAt: new Date(),
    calledAt: null, servedAt: null, completedAt: null
  };

  const renderContent = () => {
    if (uiState === 'queued' || uiState === 'called') {
      return (
        <View style={styles.queueContainer}>
          <QueueCard 
            queue={dummyQueue as any} 
            position={uiState === 'called' ? 0 : 2} 
            currentServing={currentServing as any} 
          />
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => router.push('/(patient)/queue-status')}>
            <Text style={styles.btnOutlineText}>Lihat Detail Antrean</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (uiState === 'pending') {
      return (
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>⏳</Text>
          <Text style={styles.statusTitle}>Menunggu Verifikasi</Text>
          <Text style={styles.statusText}>Silakan menuju meja pendaftaran agar petugas dapat memverifikasi identitas Anda.</Text>
        </View>
      );
    }

    if (uiState === 'verified') {
      return (
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>🩺</Text>
          <Text style={styles.statusTitle}>Identitas Terverifikasi</Text>
          <Text style={styles.statusText}>Petugas sedang mencatat keluhan Anda dan akan menentukan poli tujuan. Mohon tunggu sebentar.</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Belum ada antrean</Text>
        <Text style={styles.emptyText}>Anda belum mendaftar kunjungan untuk hari ini. Silakan daftar jika Anda ingin berobat.</Text>
        <TouchableOpacity style={styles.mainBtn} onPress={() => setUiState('pending')} activeOpacity={0.8}>
          <Text style={styles.mainBtnText}>DAFTAR KUNJUNGAN BARU</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo,</Text>
            <Text style={styles.name}>Andi (Pasien)</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.logoutText}>Kembali</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

        {/* Development Tools for UI Testing */}
        <View style={styles.devTools}>
          <Text style={styles.devTitle}>🛠 Simulasi Tampilan (Testing UI):</Text>
          <View style={styles.devGrid}>
            <TouchableOpacity style={[styles.devBtn, uiState === 'idle' && styles.devBtnActive]} onPress={() => setUiState('idle')}>
              <Text style={[styles.devBtnText, uiState === 'idle' && styles.devBtnTextActive]}>1. Belum Daftar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.devBtn, uiState === 'pending' && styles.devBtnActive]} onPress={() => setUiState('pending')}>
              <Text style={[styles.devBtnText, uiState === 'pending' && styles.devBtnTextActive]}>2. Pending Verif</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.devBtn, uiState === 'verified' && styles.devBtnActive]} onPress={() => setUiState('verified')}>
              <Text style={[styles.devBtnText, uiState === 'verified' && styles.devBtnTextActive]}>3. Terverifikasi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.devBtn, uiState === 'queued' && styles.devBtnActive]} onPress={() => setUiState('queued')}>
              <Text style={[styles.devBtnText, uiState === 'queued' && styles.devBtnTextActive]}>4. Dapat Nomor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.devBtn, uiState === 'called' && styles.devBtnActive]} onPress={() => setUiState('called')}>
              <Text style={[styles.devBtnText, uiState === 'called' && styles.devBtnTextActive]}>5. Dipanggil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: Colors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 48 },
  greeting: { color: Colors.primaryContainer, fontSize: 16 },
  name: { color: Colors.onPrimary, fontSize: 24, fontWeight: '800' },
  logoutText: { color: Colors.onPrimary, fontSize: 14, fontWeight: '600' },
  queueContainer: { marginTop: -30, zIndex: 10 },
  btn: { marginHorizontal: 24, marginTop: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnOutline: { borderWidth: 2, borderColor: Colors.primary },
  btnOutlineText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  statusCard: { margin: 24, marginTop: -20, backgroundColor: Colors.surface, padding: 32, borderRadius: 20, alignItems: 'center', elevation: 4 },
  statusEmoji: { fontSize: 48, marginBottom: 16 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginBottom: 8, textAlign: 'center' },
  statusText: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  emptyContainer: { margin: 24, marginTop: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 },
  mainBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 50, width: '100%', alignItems: 'center', elevation: 3 },
  mainBtnText: { color: Colors.onPrimary, fontWeight: '800', letterSpacing: 1 },
  
  devTools: { margin: 24, marginTop: 40, padding: 16, backgroundColor: Colors.grey100, borderRadius: 16, borderWidth: 1, borderColor: Colors.outlineVariant, borderStyle: 'dashed' },
  devTitle: { fontSize: 13, fontWeight: '700', color: Colors.grey800, marginBottom: 12 },
  devGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  devBtn: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.outlineVariant },
  devBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  devBtnText: { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '600' },
  devBtnTextActive: { color: Colors.onPrimary },
});
