import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const { loginWithGoogle, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Sign in to your account to access your learning progress and personalized content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 h-12"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="h-5 w-5" />
            <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </CardFooter>
    </Card>
  );
}