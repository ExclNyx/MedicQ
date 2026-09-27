import firestore from '@react-native-firebase/firestore';
import { Collections, fromFirestore, getTodayString } from '../core/config/firebase';
import { RegistrationModel, RegistrationStatus } from '../core/models';

export class RegistrationRepository {
  private col = firestore().collection(Collections.REGISTRATIONS);

  async create(data: Omit<RegistrationModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await this.col.add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  async getById(id: string): Promise<RegistrationModel | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as RegistrationModel;
  }

  async updateStatus(
    id: string,
    status: RegistrationStatus,
    extra?: Partial<RegistrationModel>
  ): Promise<void> {
    await this.col.doc(id).update({
      status,
      ...extra,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  // Listen to all REGISTRATION_PENDING for today (staff dashboard)
  listenPending(callback: (registrations: RegistrationModel[]) => void): () => void {
    const today = getTodayString();
    return this.col
      .where('visitDate', '==', today)
      .where('status', '==', 'REGISTRATION_PENDING')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as RegistrationModel)
        );
        callback(items);
      });
  }

  // Listen to all registrations for today with status VERIFIED (awaiting queue)
  listenVerified(callback: (registrations: RegistrationModel[]) => void): () => void {
    const today = getTodayString();
    return this.col
      .where('visitDate', '==', today)
      .where('status', '==', 'VERIFIED')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as RegistrationModel)
        );
        callback(items);
      });
  }

  // Listen to patient's today registration
  listenPatientToday(
    patientId: string,
    callback: (reg: RegistrationModel | null) => void
  ): () => void {
    const today = getTodayString();
    return this.col
      .where('patientId', '==', patientId)
      .where('visitDate', '==', today)
      .limit(1)
      .onSnapshot((snap) => {
        if (snap.empty) {
          callback(null);
        } else {
          const doc = snap.docs[0];
          callback({ id: doc.id, ...fromFirestore(doc.data()) } as unknown as RegistrationModel);
        }
      });
  }

  // History for patient
  async getPatientHistory(patientId: string, limit = 20): Promise<RegistrationModel[]> {
    const snap = await this.col
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(
      (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as RegistrationModel)
    );
  }
}

export const registrationRepository = new RegistrationRepository();
