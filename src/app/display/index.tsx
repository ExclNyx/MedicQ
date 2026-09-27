import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../core/constants/colors';
import { DisplayBoard } from '../../components/display/DisplayBoard';

export default function DisplayScreen() {
  // DUMMY DATA FOR TV UI
  const displayService = { id: 'poli_umum', name: 'Poli Umum' };
  const currentQueue = { id: 'q1', queueNumber: 'A-026', status: 'CALLED' };
  const nextQueues = [
    { id: 'q2', queueNumber: 'A-027' },
    { id: 'q3', queueNumber: 'A-028' },
    { id: 'q4', queueNumber: 'A-029' },
    { id: 'q5', queueNumber: 'A-030' },
  ];

  return (
    <View style={styles.container}>
      <DisplayBoard 
        service={displayService as any} 
        currentQueue={currentQueue as any} 
        nextQueues={nextQueues as any} 
      />
      
      {/* Tombol kembali untuk UI Testing */}
      <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(auth)/login')}>
        <Text style={{color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 'bold'}}>✖ KELUAR MODE TV</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  exitBtn: { position: 'absolute', top: 40, right: 30, padding: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, zIndex: 100 }
});
