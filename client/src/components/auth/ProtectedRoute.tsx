import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render the children when authenticated
  return currentUser ? <>{children}</> : null;
}