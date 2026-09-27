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
  sequenceNumber: number; // 27
  createdAt: Date;
  calledAt: Date | null;
  servedAt: Date | null;
  completedAt: Date | null;
}
