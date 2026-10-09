import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../core/config/firebase';
import { UserModel } from '../core/models';
import { userRepository } from '../repositories/user.repository';

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/missing-password':
      return 'Kata sandi wajib diisi.';
    case 'auth/operation-not-allowed':
      return 'Login email/password belum diaktifkan di Firebase Authentication.';
    case 'auth/invalid-api-key':
      return 'Firebase API key tidak valid. Periksa konfigurasi Firebase di file .env.';
    case 'auth/project-not-found':
      return 'Project Firebase tidak ditemukan. Periksa projectId pada konfigurasi.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Coba lagi beberapa saat.';
    case 'auth/network-request-failed':
      return 'Tidak ada koneksi internet. Periksa jaringan Anda.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan. Hubungi petugas.';
    default:
      return (error as Error)?.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

export class AuthService {
  async signInWithEmail(email: string, password: string): Promise<UserModel> {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

    let profile: UserModel | null;
    try {
      profile = await userRepository.getById(cred.user.uid);
    } catch (error) {
      // Jangan meninggalkan session yang tampak login tetapi profilnya gagal dibaca.
      try {
        await signOut(auth);
      } catch {
        // Pertahankan error awal agar bisa ditampilkan pada form login.
      }
      throw error;
    }

    if (!profile) {
      await signOut(auth);
      throw new Error(
        'Profil pengguna di Firestore belum tersedia atau nilai role tidak valid. Pastikan users/{UID} memakai UID Authentication yang sama dan role bernilai patient, staff, atau admin.',
      );
    }

    return profile;
  }

  async registerPatient(
    email: string,
    password: string,
    displayName: string,
  ): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

    try {
      await updateProfile(cred.user, { displayName });
      await userRepository.create(cred.user.uid, {
        email: normalizedEmail,
        role: 'patient',
        displayName,
      });
      return cred.user.uid;
    } catch (error) {
      // Hindari akun Auth "yatim" jika pembuatan profil Firestore gagal.
      try {
        await deleteUser(cred.user);
      } catch {
        await signOut(auth);
      }
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (uid: string | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => callback(user?.uid ?? null));
  }
}

export const authService = new AuthService();
