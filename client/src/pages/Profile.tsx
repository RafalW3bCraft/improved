import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfile from '@/components/auth/UserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="progress">Learning Progress</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-0">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Track your language learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">
                      Your learning statistics will appear here as you progress through lessons.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>Customize your learning experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">
                      Preference settings will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}