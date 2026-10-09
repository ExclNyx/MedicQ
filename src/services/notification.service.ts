/**
 * Presentasi MedicQ: notifikasi OS dan getaran dinonaktifkan sementara.
 * Pemantauan antrean tetap berjalan melalui listener Firestore di usePatientQueue.
 * API kecil ini dipertahankan agar pemanggil lama tidak membuat aplikasi crash.
 * Notifikasi bisa diaktifkan kembali saat membuat Development Build.
 */
export class NotificationService {
  async prepare(): Promise<boolean> {
    return false;
  }

  async showLocalNotification(
    _title: string,
    _body: string,
  ): Promise<void> {
    // Disabled for presentation build.
  }

  async vibrate(
    _level: 'warning' | 'urgent' | 'called',
  ): Promise<void> {
    // Disabled for presentation build.
  }

  onForegroundMessage(
    _callback: (message: unknown) => void,
  ): () => void {
    return () => {};
  }
}

export const notificationService = new NotificationService();
