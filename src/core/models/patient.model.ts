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
