import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, Collections, fromFirestore } from '../core/config/firebase';
import { PatientModel } from '../core/models';

function buildMedicalRecordNumber(id: string, nik: string): string {
  // Dipakai untuk data baru. Data lama tetap kompatibel karena field ini optional.
  const source = (id || nik).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return `RM-${source.slice(-8)}`;
}

export class PatientRepository {
  async getById(id: string): Promise<PatientModel | null> {
    const docRef = doc(db, Collections.PATIENTS, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...fromFirestore(snap.data()) } as unknown as PatientModel;
  }

  async upsert(
    id: string,
    data: Omit<PatientModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const docRef = doc(db, Collections.PATIENTS, id);
    const existing = await getDoc(docRef);
    const medicalRecordNumber =
      data.medicalRecordNumber ||
      (existing.exists()
        ? (existing.data().medicalRecordNumber as string | undefined)
        : undefined) ||
      buildMedicalRecordNumber(id, data.nik);

    const payload = {
      ...data,
      medicalRecordNumber,
    };

    if (existing.exists()) {
      await updateDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async setVerified(id: string, isVerified: boolean): Promise<void> {
    const docRef = doc(db, Collections.PATIENTS, id);
    await updateDoc(docRef, {
      isVerified,
      updatedAt: serverTimestamp(),
    });
  }

  async searchByNik(nik: string): Promise<PatientModel | null> {
    const q = query(
      collection(db, Collections.PATIENTS),
      where('nik', '==', nik),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...fromFirestore(docSnap.data()) } as unknown as PatientModel;
  }

  async search(term: string): Promise<PatientModel[]> {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return [];

    // Exact NIK lookup first (efficient common path).
    if (/^\d{16}$/.test(normalized)) {
      const exact = await this.searchByNik(normalized);
      return exact ? [exact] : [];
    }

    // Exact document ID lookup (useful when staff has a medical record/document ID).
    const byId = await this.getById(term.trim());
    if (byId) return [byId];

    // Name/RM search is intentionally client-side for the current coursework-scale dataset.
    // A production system should add normalized search fields / a dedicated search service.
    const snap = await getDocs(collection(db, Collections.PATIENTS));
    const patients = snap.docs.map(
      (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as PatientModel),
    );

    return patients.filter((patient) => {
      const name = patient.fullName.toLowerCase();
      const rm = (patient.medicalRecordNumber ?? '').toLowerCase();
      const nik = patient.nik.toLowerCase();
      return name.includes(normalized) || rm.includes(normalized) || nik.includes(normalized);
    });
  }

  async listAll(): Promise<PatientModel[]> {
    const snap = await getDocs(collection(db, Collections.PATIENTS));
    return snap.docs.map(
      (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as PatientModel),
    );
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, Collections.PATIENTS, id));
  }
}

export const patientRepository = new PatientRepository();
