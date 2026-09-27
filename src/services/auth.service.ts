import auth from '@react-native-firebase/auth';
import { userRepository } from '../repositories/user.repository';
import { patientRepository } from '../repositories/patient.repository';
import { UserModel, UserRole } from '../core/models';

export class AuthService {
  async signInWithEmail(email: string, password: string): Promise<UserModel> {
    const cred = await auth().signInWithEmailAndPassword(email, password);
    const user = await userRepository.getById(cred.user.uid);
    if (!user) throw new Error('User profile not found');
    return user;
  }

  async registerPatient(
    email: string,
    password: string,
    displayName: string
  ): Promise<string> {
    const cred = await auth().createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    await userRepository.create(cred.user.uid, {
      email,
      role: 'patient',
      displayName,
    });
    return cred.user.uid;
  }

  async signOut(): Promise<void> {
    await auth().signOut();
  }

  getCurrentUser() {
    return auth().currentUser;
  }

  onAuthStateChanged(callback: (uid: string | null) => void): () => void {
    return auth().onAuthStateChanged((user) => {
      callback(user ? user.uid : null);
    });
  }
}

export const authService = new AuthService();
