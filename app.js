// App.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';

// 1. Import fungsi Firestore dari Firebase JS SDK
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
// 2. Import database 'db' dari file yang baru kita buat
import { db } from './firebaseConfig'; 

export default function App() {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState('');

  // 3. Fungsi untuk menyimpan data ke Firestore
  const simpanData = async () => {
    if (!nama || !umur) {
      Alert.alert('Error', 'Nama dan umur pasien harus diisi!');
      return;
    }

    try {
      // 4. Memasukkan data ke collection bernama "pasien"
      const docRef = await addDoc(collection(db, "pasien"), {
        nama_lengkap: nama,
        umur: parseInt(umur),
        tanggal_daftar: serverTimestamp(), // Menggunakan waktu dari server Firebase
      });

      Alert.alert('Sukses', `Data masuk dengan ID: ${docRef.id}`);
      setNama(''); // Kosongkan form
      setUmur('');
    } catch (e) {
      console.error("Error menambahkan dokumen: ", e);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Input Data MedicQ (Expo)</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nama Pasien"
        value={nama}
        onChangeText={setNama}
      />
      <TextInput
        style={styles.input}
        placeholder="Umur"
        value={umur}
        keyboardType="numeric"
        onChangeText={setUmur}
      />
      
      <Button title="Simpan Data ke Firebase" onPress={simpanData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});