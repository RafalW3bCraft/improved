import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any authentication errors
  const clearError = () => setError(null);

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      clearError();
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to sign in with Google. Please try again.');
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      clearError();
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out. Please try again.');
      throw err;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    loginWithGoogle,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}