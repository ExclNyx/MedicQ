import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';

export const useAuth = () => {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubAuth = authService.onAuthStateChanged(async (uid) => {
      if (uid) {
        const userModel = await userRepository.getById(uid);
        setUser(userModel);
      } else {
        setUser(null);
      }
      setInitialized(true);
    });

    return () => unsubAuth();
  }, []);

  return { user, isLoading, isInitialized, setLoading };
};
