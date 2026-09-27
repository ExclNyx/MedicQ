import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.iconCircle}><Text style={styles.iconText}>🏥</Text></View>
          <Text style={styles.appName}>PuskesmasQueue</Text>
          <Text style={styles.tagline}>Sistem Antrean Digital Puskesmas</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Mode Demo UI (Tanpa Database)</Text>
          <Text style={{textAlign: 'center', marginBottom: 24, color: Colors.onSurfaceVariant, fontSize: 13}}>
            Pilih menu di bawah ini untuk melihat tampilan aplikasi secara langsung.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={() => router.push('/(patient)/home')} activeOpacity={0.8}>
            <Text style={styles.btnText}>👨‍👩‍👦 TAMPILAN PASIEN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.secondary }]} onPress={() => router.push('/(staff)/dashboard')} activeOpacity={0.8}>
            <Text style={styles.btnText}>👨‍⚕️ TAMPILAN PETUGAS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.grey800, marginBottom: 0 }]} onPress={() => router.push('/display')} activeOpacity={0.8}>
            <Text style={styles.btnText}>📺 TAMPILAN LAYAR TV</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Lihat Form Pendaftaran Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: { alignItems: 'center', paddingVertical: 48, backgroundColor: Colors.primary },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  iconText: { fontSize: 40 },
  appName: { fontSize: 24, fontWeight: '800', color: Colors.onPrimary },
  tagline: { fontSize: 13, color: Colors.primaryContainer, marginTop: 4 },
  form: { backgroundColor: Colors.surface, margin: 20, borderRadius: 20, padding: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  formTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginBottom: 8, textAlign: 'center' },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16, backgroundColor: Colors.primary },
  btnText: { color: Colors.onPrimary, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 24 },
  linkBtn: { alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
