import firestore from '@react-native-firebase/firestore';
import { Collections, fromFirestore } from '../core/config/firebase';
import { PatientModel } from '../core/models';

export class PatientRepository {
  private col = firestore().collection(Collections.PATIENTS);

  async getById(id: string): Promise<PatientModel | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as PatientModel;
  }

  async upsert(id: string, data: Omit<PatientModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const existing = await this.col.doc(id).get();
    if (existing.exists) {
      await this.col.doc(id).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await this.col.doc(id).set({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  async setVerified(id: string, isVerified: boolean): Promise<void> {
    await this.col.doc(id).update({
      isVerified,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  async searchByNik(nik: string): Promise<PatientModel | null> {
    const snap = await this.col.where('nik', '==', nik).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as PatientModel;
  }
}

export const patientRepository = new PatientRepository();
