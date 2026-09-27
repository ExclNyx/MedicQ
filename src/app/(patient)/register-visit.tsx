import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function RegisterVisitScreen() {
  const handleSubmit = () => {
    Alert.alert(
      'Berhasil (UI Demo)',
      'Pendaftaran berhasil. Silakan menuju meja petugas untuk verifikasi.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Konfirmasi Kunjungan</Text>
        <Text style={styles.desc}>
          Apakah Anda ingin mendaftar kunjungan untuk hari ini? 
          Setelah mendaftar, Anda harus menemui petugas di puskesmas untuk melakukan verifikasi identitas dan pencatatan keluhan.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nama Pasien</Text>
          <Text style={styles.infoValue}>Andi (Dummy Pasien)</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.btnText}>YA, DAFTAR SEKARANG</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnCancel} onPress={() => router.back()}>
          <Text style={styles.btnCancelText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, justifyContent: 'center' },
  card: { backgroundColor: Colors.surface, padding: 24, borderRadius: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.onSurface, marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  infoBox: { backgroundColor: Colors.grey100, padding: 16, borderRadius: 12, marginBottom: 32 },
  infoLabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  btn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 14 },
  btnCancel: { padding: 16, alignItems: 'center' },
  btnCancelText: { color: Colors.error, fontWeight: '600', fontSize: 14 },
});
