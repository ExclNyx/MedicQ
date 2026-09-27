import firestore from '@react-native-firebase/firestore';
import { Collections, fromFirestore } from '../core/config/firebase';
import { UserModel, UserRole } from '../core/models';

export class UserRepository {
  private col = firestore().collection(Collections.USERS);

  async getById(uid: string): Promise<UserModel | null> {
    const doc = await this.col.doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as UserModel;
  }

  async create(uid: string, data: Omit<UserModel, 'uid' | 'createdAt'>): Promise<void> {
    await this.col.doc(uid).set({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  async updateRole(uid: string, role: UserRole): Promise<void> {
    await this.col.doc(uid).update({ role });
  }

  listenById(uid: string, callback: (user: UserModel | null) => void): () => void {
    return this.col.doc(uid).onSnapshot((doc) => {
      if (!doc.exists) {
        callback(null);
        return;
      }
      callback({ uid: doc.id, ...fromFirestore(doc.data()) } as unknown as UserModel);
    });
  }
}

export const userRepository = new UserRepository();
