export type Gender = 'male' | 'female';

export interface PatientModel {
  id: string; // same as uid
  nik: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
