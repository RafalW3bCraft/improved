import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Your account information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            {currentUser.photoURL ? (
              <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
            ) : (
              <AvatarFallback className="text-lg">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-xl font-medium">{currentUser.displayName || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            {currentUser.emailVerified && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2">Account Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Account ID</div>
            <div className="font-mono">{currentUser.uid.substring(0, 8)}...</div>
            
            <div className="text-muted-foreground">Created</div>
            <div>{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</div>
            
            <div className="text-muted-foreground">Last Login</div>
            <div>{currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</div>
            
            <div className="text-muted-foreground">Provider</div>
            <div className="capitalize">{currentUser.providerData[0]?.providerId.replace('.com', '')}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate('/settings')}>
          Settings
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
}