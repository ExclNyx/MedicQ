import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, Collections, fromFirestore } from '../core/config/firebase';
import { isUserRole, type UserModel, type UserRole } from '../core/models';

function mapUser(uid: string, raw: Record<string, unknown>): UserModel | null {
  const data = fromFirestore(raw) as Record<string, unknown>;
  if (!isUserRole(data.role)) return null;
  // Keep the Firebase Auth UID authoritative; never trust a stored uid field.
  return { ...data, uid } as unknown as UserModel;
}

export class UserRepository {
  async getById(uid: string): Promise<UserModel | null> {
    const snapshot = await getDoc(doc(db, Collections.USERS, uid));
    if (!snapshot.exists()) return null;
    return mapUser(snapshot.id, snapshot.data() as Record<string, unknown>);
  }

  async create(uid: string, data: Omit<UserModel, 'uid' | 'createdAt'>): Promise<void> {
    await setDoc(doc(db, Collections.USERS, uid), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async updateRole(uid: string, role: UserRole): Promise<void> {
    await updateDoc(doc(db, Collections.USERS, uid), { role });
  }

  listenById(
    uid: string,
    callback: (user: UserModel | null) => void,
    onError?: (error: Error) => void,
  ): () => void {
    return onSnapshot(
      doc(db, Collections.USERS, uid),
      (snapshot) => {
        callback(
          snapshot.exists()
            ? mapUser(snapshot.id, snapshot.data() as Record<string, unknown>)
            : null,
        );
      },
      (error) => {
        // Always consume listener errors. Without this callback Firestore logs an
        // "Uncaught Error in snapshot listener" and the app may stay on a loader.
        console.warn('[MedicQ] Tidak dapat memuat profil pengguna:', error.message);
        if (onError) onError(error);
        else callback(null);
      },
    );
  }
}

export const userRepository = new UserRepository();
