import { useEffect } from 'react';
import { userRepository } from '../repositories/user.repository';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

/** Keeps the app-level authentication session synchronized with Firebase. */
export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;
    let cancelled = false;

    setLoading(true);

    const authUnsubscribe = authService.onAuthStateChanged((uid) => {
      profileUnsubscribe?.();
      profileUnsubscribe = null;

      if (cancelled) return;

      if (!uid) {
        setUser(null);
        setInitialized(true);
        setLoading(false);
        return;
      }

      profileUnsubscribe = userRepository.listenById(
        uid,
        (userModel) => {
          if (cancelled) return;
          // A missing or malformed role returns null and is routed to login,
          // never guessed as patient/staff/admin.
          setUser(userModel);
          setInitialized(true);
          setLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.warn('[MedicQ] Profil akun tidak dapat dibaca:', error.message);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        },
      );
    });

    return () => {
      cancelled = true;
      profileUnsubscribe?.();
      authUnsubscribe();
    };
  }, [setInitialized, setLoading, setUser]);
};
