import { Alert } from 'react-native';
import { queueService } from '@/services/queue.service';
import type { QueueModel } from '@/types';

/**
 * Aksi petugas pada antrean satu poli: panggil berikutnya, panggil ulang,
 * lewati (no-show), dan selesai. Dipakai dashboard dan halaman modul petugas
 * supaya logikanya hanya ada di satu tempat.
 *
 * @param serviceId      poli yang sedang dipilih
 * @param currentServing pasien yang sedang dipanggil (null/undefined bila belum ada)
 */
export function useQueueActions(serviceId: string, currentServing?: QueueModel | null) {
  const run = async (errorTitle: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (e) {
      Alert.alert(errorTitle, e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  };

  const callNext = () =>
    run('Gagal memanggil', async () => {
      const next = await queueService.callNext(serviceId);
      if (!next) Alert.alert('Antrean kosong', 'Tidak ada pasien yang sedang menunggu.');
    });

  const recall = () =>
    run('Gagal memanggil ulang', async () => {
      if (currentServing) await queueService.recallQueue(currentServing.id, serviceId);
    });

  const skip = () =>
    run('Gagal melewati antrean', async () => {
      if (currentServing) await queueService.skipQueue(currentServing.id);
    });

  const complete = () =>
    run('Gagal menyelesaikan antrean', async () => {
      if (currentServing) await queueService.completeQueue(currentServing.id, serviceId);
    });

  return { callNext, recall, skip, complete };
}
