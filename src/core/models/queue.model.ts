export type QueueStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED';

export interface QueueModel {
  id: string;
  queueNumber: string;   // e.g. "A-027"
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  registrationId: string;
  visitDate: string;     // YYYY-MM-DD
  status: QueueStatus;
  sequenceNumber: number; // nomor asli yang tercetak pada tiket
  /** Urutan tunggu aktif. Saat no-show, nilai ini dipindah ke belakang antrean. */
  queueOrder?: number;
  /** Berapa kali pasien pernah dilewati/no-show pada kunjungan ini. */
  skipCount?: number;
  /** Versi pemanggilan; bertambah saat dipanggil atau dipanggil ulang. */
  callCount?: number;
  createdAt: Date;
  calledAt: Date | null;
  servedAt: Date | null;
  completedAt: Date | null;
  lastSkippedAt?: Date | null;
}
