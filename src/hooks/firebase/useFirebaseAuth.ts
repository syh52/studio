import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      try {
        setUser(firebaseUser);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}; 