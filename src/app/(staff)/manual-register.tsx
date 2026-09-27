import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function ManualRegisterScreen() {
  const [searchNik, setSearchNik] = useState('');
  
  const handleSearch = () => {
    Alert.alert('Simulasi UI', 'Fitur pencarian hanya tersedia saat database terkoneksi.');
  };

  const handleRegisterNew = () => {
    router.replace('/(staff)/patient-detail');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.title}>Cari Pasien Lama</Text>
        <Text style={styles.label}>Masukkan NIK</Text>
        <View style={styles.searchRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={searchNik} onChangeText={setSearchNik} placeholder="16 digit NIK" keyboardType="numeric" maxLength={16} />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>CARI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Daftar Pasien Baru (Manual)</Text>
        <Text style={styles.label}>NIK *</Text>
        <TextInput style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Nama Lengkap *</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Tanggal Lahir (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Jenis Kelamin</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity style={[styles.genderBtn, styles.genderActive]}>
            <Text style={{color: Colors.primary}}>Laki-laki</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.genderBtn}>
            <Text>Perempuan</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Alamat *</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>No. HP (Opsional)</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" />

        <TouchableOpacity style={styles.btn} onPress={handleRegisterNew}>
          <Text style={styles.btnText}>SIMPAN & DAFTAR KUNJUNGAN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  card: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, height: 48, justifyContent: 'center', borderRadius: 10 },
  searchBtnText: { color: Colors.onPrimary, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 10, paddingHorizontal: 14, height: 48, backgroundColor: Colors.grey100, marginBottom: 16 },
  genderBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 10, alignItems: 'center' },
  genderActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  btn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 14 },
});
