/**
 * Shared data types for MedicQ.
 * Keep the shape of Firestore and screen data here so it is easy to locate.
 */

export type Gender = 'male' | 'female';

export interface PatientModel {
  id: string;
  nik: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  /** Optional so older Firestore documents remain compatible. */
  medicalRecordNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export type RegistrationStatus =
  | 'REGISTRATION_PENDING'
  | 'VERIFIED'
  | 'QUEUED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RegistrationModel {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string; // YYYY-MM-DD
  status: RegistrationStatus;
  complaints: string[];
  complaintNote: string;
  serviceId: string | null;
  serviceName: string | null;
  queueId: string | null;
  staffId: string | null;
  isManual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceModel {
  id: string;
  name: string;              // "Poli Umum"
  code: string;              // "A"
  isActive: boolean;
  currentServing: string | null; // current queue number being served
  currentServingQueueId: string | null;
}

export type UserRole = 'patient' | 'staff' | 'admin';

/** Reject malformed Firestore roles instead of routing users between role layouts. */
export function isUserRole(value: unknown): value is UserRole {
  return value === 'patient' || value === 'staff' || value === 'admin';
}

export interface UserModel {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: Date;
}
