import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function CompleteProfileScreen() {
  const [nik, setNik] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    Alert.alert(
      'Berhasil (UI Demo)',
      'Data diri berhasil disimpan.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.info}>Data ini diperlukan untuk verifikasi identitas oleh petugas.</Text>
          <Text style={styles.label}>NIK (16 digit)</Text>
          <TextInput style={styles.input} value={nik} onChangeText={setNik} placeholder="3374..." keyboardType="numeric" maxLength={16} />
          
          <Text style={styles.label}>Nama Lengkap (sesuai KTP)</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nama lengkap" />
          
          <Text style={styles.label}>Tanggal Lahir (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="1990-01-01" keyboardType="numeric" />
          
          <Text style={styles.label}>Jenis Kelamin</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]} onPress={() => setGender('male')}>
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>👨 Laki-laki</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]} onPress={() => setGender('female')}>
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>👩 Perempuan</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Alamat</Text>
          <TextInput style={[styles.input, styles.inputMulti]} value={address} onChangeText={setAddress} placeholder="Jl. ..." multiline numberOfLines={3} />
          
          <Text style={styles.label}>Nomor HP</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="08..." keyboardType="phone-pad" />
          
          <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.btnText}>SIMPAN DATA DIRI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 20 },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, elevation: 2 },
  info: { fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 20, lineHeight: 20, backgroundColor: Colors.primaryContainer, padding: 12, borderRadius: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.onSurface, backgroundColor: Colors.grey100, marginBottom: 16 },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderBtn: { flex: 1, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.grey100 },
  genderBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  genderText: { fontSize: 14, color: Colors.onSurfaceVariant },
  genderTextActive: { color: Colors.primary, fontWeight: '600' },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
