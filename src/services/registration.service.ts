import { registrationRepository } from '../repositories/registration.repository';
import { patientRepository } from '../repositories/patient.repository';
import { RegistrationModel } from '../core/models';
import { getTodayString } from '../core/config/firebase';

export interface CreateRegistrationInput {
  patientId: string;
  patientName: string;
  isManual?: boolean;
}

export interface VerifyAndComplaintInput {
  registrationId: string;
  staffId: string;
  complaints: string[];
  complaintNote: string;
}

export class RegistrationService {
  async createRegistration(input: CreateRegistrationInput): Promise<string> {
    const today = getTodayString();

    // Check if patient already has a registration today
    const existing = await this.getPatientTodayRegistration(input.patientId);
    if (existing && existing.status !== 'CANCELLED') {
      throw new Error('Pasien sudah terdaftar hari ini');
    }

    const id = await registrationRepository.create({
      patientId: input.patientId,
      patientName: input.patientName,
      visitDate: today,
      status: 'REGISTRATION_PENDING',
      complaints: [],
      complaintNote: '',
      serviceId: null,
      serviceName: null,
      queueId: null,
      staffId: null,
      isManual: input.isManual ?? false,
    });

    return id;
  }

  async verifyPatient(registrationId: string, staffId: string): Promise<void> {
    await registrationRepository.updateStatus(registrationId, 'VERIFIED', { staffId });
    const reg = await registrationRepository.getById(registrationId);
    if (reg) {
      await patientRepository.setVerified(reg.patientId, true);
    }
  }

  async updateComplaints(input: VerifyAndComplaintInput): Promise<void> {
    await registrationRepository.updateStatus(input.registrationId, 'VERIFIED', {
      staffId: input.staffId,
      complaints: input.complaints,
      complaintNote: input.complaintNote,
    });
  }

  async getPatientTodayRegistration(patientId: string): Promise<RegistrationModel | null> {
    return new Promise((resolve) => {
      const unsub = registrationRepository.listenPatientToday(patientId, (reg) => {
        unsub();
        resolve(reg);
      });
    });
  }

  async getHistory(patientId: string): Promise<RegistrationModel[]> {
    return registrationRepository.getPatientHistory(patientId);
  }
}

export const registrationService = new RegistrationService();
