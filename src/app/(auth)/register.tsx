import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = () => {
    Alert.alert(
      'Berhasil (UI Demo)',
      'Akun berhasil dibuat. Silakan lengkapi data diri Anda.',
      [{ text: 'Lanjut', onPress: () => router.replace('/(auth)/complete-profile') }]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.info}>Daftarkan akun pasien baru. Setelah akun dibuat, Anda perlu melengkapi data diri.</Text>

          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama sesuai KTP" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@contoh.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" secureTextEntry />

          <Text style={styles.label}>Konfirmasi Password</Text>
          <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder="Ulangi password" secureTextEntry />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.btnText}>BUAT AKUN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
            <Text style={styles.linkText}>Sudah punya akun? <Text style={styles.linkHighlight}>Masuk</Text></Text>
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
  btn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '700' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.onSurfaceVariant },
  linkHighlight: { color: Colors.primary, fontWeight: '600' },
});
