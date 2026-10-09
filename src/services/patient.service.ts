import { Gender, PatientModel } from '../core/models';
import { patientRepository } from '../repositories/patient.repository';

export interface CreatePatientInput {
  nik: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  address: string;
  phoneNumber: string;
  medicalRecordNumber?: string;
}

export class PatientService {
  async createOrUpdateProfile(patientId: string, input: CreatePatientInput): Promise<void> {
    await patientRepository.upsert(patientId, {
      ...input,
      isVerified: false,
    });
  }

  async getProfile(patientId: string): Promise<PatientModel | null> {
    return patientRepository.getById(patientId);
  }

  async findByNik(nik: string): Promise<PatientModel | null> {
    return patientRepository.searchByNik(nik);
  }

  async search(term: string): Promise<PatientModel[]> {
    return patientRepository.search(term);
  }

  async listAll(): Promise<PatientModel[]> {
    return patientRepository.listAll();
  }

  async delete(patientId: string): Promise<void> {
    return patientRepository.delete(patientId);
  }

  maskNik(nik: string): string {
    if (!nik || nik.length < 4) return '****';
    return '*'.repeat(nik.length - 4) + nik.slice(-4);
  }
}

export const patientService = new PatientService();
