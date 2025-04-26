import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { currentUser, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/profile');
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  );
}