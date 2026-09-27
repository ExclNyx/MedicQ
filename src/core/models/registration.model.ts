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
