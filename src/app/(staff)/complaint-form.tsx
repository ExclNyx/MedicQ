import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';
import { COMPLAINT_OPTIONS } from '../../core/constants/complaints';

export default function ComplaintFormScreen() {
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const services = [
    { id: 'poli_umum', name: 'Poli Umum' },
    { id: 'poli_gigi', name: 'Poli Gigi' },
    { id: 'kia', name: 'KIA' },
    { id: 'lansia', name: 'Poli Lansia' },
  ];

  const toggleComplaint = (label: string) => {
    if (selectedComplaints.includes(label)) {
      setSelectedComplaints(prev => prev.filter(c => c !== label));
    } else {
      setSelectedComplaints(prev => [...prev, label]);
    }
  };

  const handleSubmit = () => {
    if (!selectedService) {
      Alert.alert('Perhatian', 'Silakan pilih poli tujuan terlebih dahulu');
      return;
    }
    
    const svc = services.find(s => s.id === selectedService);
    
    Alert.alert(
      'Antrean Dibuat (UI Demo)',
      `Pasien masuk ke ${svc?.name}.\n\nNomor Antrean: A-029`,
      [{ text: 'Kembali ke Dashboard', onPress: () => router.navigate('/(staff)/dashboard') }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pencatatan Keluhan</Text>
          <Text style={styles.desc}>Pilih keluhan umum atau ketik manual (opsional)</Text>
          
          <View style={styles.grid}>
            {COMPLAINT_OPTIONS.map((opt) => {
              const active = selectedComplaints.includes(opt.label);
              return (
                <TouchableOpacity key={opt.id} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleComplaint(opt.label)}>
                  <Text style={styles.chipEmoji}>{opt.icon}</Text>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.inputArea}
            placeholder="Catatan keluhan tambahan..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Penentuan Poli Tujuan <Text style={{color: Colors.error}}>*</Text></Text>
          <Text style={styles.desc}>Pilih poli sesuai dengan keluhan pasien</Text>

          {services.map(svc => (
            <TouchableOpacity key={svc.id} style={[styles.radioItem, selectedService === svc.id && styles.radioItemActive]} onPress={() => setSelectedService(svc.id)}>
              <View style={[styles.radioOuter, selectedService === svc.id && { borderColor: Colors.primary }]}>
                {selectedService === svc.id && <View style={styles.radioInner} />}
              </View>
              <View>
                <Text style={[styles.radioText, selectedService === svc.id && { color: Colors.primary, fontWeight: '700' }]}>{svc.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>BUAT NOMOR ANTREAN</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  card: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 },
  desc: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.outlineVariant },
  chipActive: { backgroundColor: Colors.primaryContainer, borderColor: Colors.primary },
  chipEmoji: { fontSize: 14, marginRight: 6 },
  chipText: { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '500' },
  chipTextActive: { color: Colors.onPrimaryContainer, fontWeight: '700' },
  inputArea: { borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, padding: 12, backgroundColor: Colors.grey100, textAlignVertical: 'top', minHeight: 80 },
  radioItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, marginBottom: 10, backgroundColor: Colors.surface },
  radioItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  radioText: { fontSize: 15, fontWeight: '600', color: Colors.onSurfaceVariant },
  btn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  btnText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 14 },
});
