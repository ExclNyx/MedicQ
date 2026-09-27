import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function PatientDetailScreen() {
  const handleVerify = () => {
    Alert.alert('Berhasil', 'Identitas terverifikasi (UI Demo)', [
      { 
        text: 'Lanjut ke Keluhan', 
        onPress: () => router.push('/(staff)/complaint-form')
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Data Identitas Pasien</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>NIK</Text>
          <Text style={styles.value}>3374123456789012</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <Text style={styles.value}>Budi Santoso</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <Text style={styles.value}>10 Januari 1990</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <Text style={styles.value}>Laki-laki</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>Jl. Merdeka No. 123, Semarang</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No. HP</Text>
          <Text style={styles.value}>081234567890</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleVerify}>
          <Text style={styles.btnText}>VERIFIKASI & LANJUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  card: { backgroundColor: Colors.surface, padding: 24, borderRadius: 16, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  row: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant, paddingBottom: 8 },
  label: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  btn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 14 },
});
