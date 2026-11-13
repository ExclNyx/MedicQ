import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { createQueue, fetchQueues, updateQueueStatus } from '@/services/queue.rest';
import type { QueueModel, QueueStatus } from '@/types';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga.';
}

/**
 * State + aksi antrean berbasis REST (fetch/async-await).
 *
 * 01 Tampilkan data  : GET di useEffect saat layar dibuka / poli berganti
 * 02 Loading         : `loading` (muat awal) dan `refreshing` (muat ulang)
 * 03 Tambah          : `addQueue`  -> POST
 * 04 Ubah status     : `changeStatus` -> PATCH
 * 05 Error handling  : try/catch + Alert di setiap aksi
 * 06 Refresh         : `refresh` -> GET ulang
 */
export function useAsyncQueues(serviceId: string) {
  const [queues, setQueues] = useState<QueueModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 01 + 02 + 05: ambil data saat komponen dimuat atau poli berganti.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchQueues(serviceId);
        if (!cancelled) setQueues(data);
      } catch (e) {
        if (!cancelled) {
          setQueues([]);
          setError(messageOf(e));
          Alert.alert('Gagal memuat antrean', messageOf(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  // 06: ambil ulang data dari server (tombol reload & pull-to-refresh).
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      setQueues(await fetchQueues(serviceId));
    } catch (e) {
      setError(messageOf(e));
      Alert.alert('Gagal memuat ulang', messageOf(e));
    } finally {
      setRefreshing(false);
    }
  }, [serviceId]);

  // 03: POST nomor antrean baru. Mengembalikan true bila berhasil.
  const addQueue = useCallback(
    async (patientName: string): Promise<boolean> => {
      if (!patientName.trim()) {
        Alert.alert('Nama kosong', 'Isi nama pasien terlebih dahulu.');
        return false;
      }
      setSaving(true);
      try {
        const created = await createQueue({ patientName, serviceId });
        setQueues((prev) => [...prev, created]);
        Alert.alert('Berhasil', `Nomor antrean ${created.queueNumber} dibuat untuk ${created.patientName}.`);
        return true;
      } catch (e) {
        Alert.alert('Gagal menambah antrean', messageOf(e));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [serviceId],
  );

  // 04: PATCH status; UI diperbarui setelah server menjawab sukses.
  const changeStatus = useCallback(async (queue: QueueModel, status: QueueStatus) => {
    setBusyId(queue.id);
    try {
      const updated = await updateQueueStatus(queue, status);
      setQueues((prev) => prev.map((item) => (item.id === queue.id ? updated : item)));
    } catch (e) {
      Alert.alert('Gagal mengubah status', messageOf(e));
    } finally {
      setBusyId(null);
    }
  }, []);

  return { queues, loading, refreshing, saving, busyId, error, refresh, addQueue, changeStatus };
}
