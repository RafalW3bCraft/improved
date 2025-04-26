import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Database, Server, Shield, Volume2, Globe, Clock, Moon, User, Bell } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// Define an interface for settings
interface UserSettings {
  pronunciation: {
    enabled: boolean;
    volume: number;
    accent: string;
  };
  grammar: {
    enabled: boolean;
    showConjugations: boolean;
  };
  translation: {
    enabled: boolean;
    language: string;
  };
  appearance: {
    darkMode: boolean;
    textSize: string;
    fontStyle: string;
  };
  notifications: {
    enabled: boolean;
    reminderTime: string;
    weeklyReport: boolean;
    achievements: boolean;
  };
  learning: {
    dailyGoal: string;
    cefrLevel: string;
    offlineMode: boolean;
  };
}

export default function Settings() {
  // Initialize settings with default values
  const [settings, setSettings] = useState<UserSettings>({
    pronunciation: {
      enabled: true,
      volume: 75,
      accent: "spain"
    },
    grammar: {
      enabled: true,
      showConjugations: true
    },
    translation: {
      enabled: true,
      language: "english"
    },
    appearance: {
      darkMode: false,
      textSize: "medium",
      fontStyle: "system"
    },
    notifications: {
      enabled: true,
      reminderTime: "18:00",
      weeklyReport: true,
      achievements: true
    },
    learning: {
      dailyGoal: "15",
      cefrLevel: "b1",
      offlineMode: false
    }
  });

  // Legacy state variables for backward compatibility
  const [pronunciationVolume, setPronunciationVolume] = useState<number[]>([settings.pronunciation.volume]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications.enabled);
  const [dailyGoal, setDailyGoal] = useState(settings.learning.dailyGoal);
  const [darkModeEnabled, setDarkModeEnabled] = useState(settings.appearance.darkMode);
  const [offlineMode, setOfflineMode] = useState(settings.learning.offlineMode);
  const [pronunciationAccent, setPronunciationAccent] = useState(settings.pronunciation.accent);
  const [translationLanguage, setTranslationLanguage] = useState(settings.translation.language);
  const [reminderTime, setReminderTime] = useState(settings.notifications.reminderTime);
  
  // New state variables for word analysis features
  const [showPronunciation, setShowPronunciation] = useState(settings.pronunciation.enabled);
  const [showTranslation, setShowTranslation] = useState(settings.translation.enabled);
  const [showGrammar, setShowGrammar] = useState(settings.grammar.enabled);
  const [showConjugations, setShowConjugations] = useState(settings.grammar.showConjugations);
  
  // Save settings to localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as UserSettings;
        setSettings(parsedSettings);
        
        // Update legacy state variables
        setPronunciationVolume([parsedSettings.pronunciation.volume]);
        setNotificationsEnabled(parsedSettings.notifications.enabled);
        setDailyGoal(parsedSettings.learning.dailyGoal);
        setDarkModeEnabled(parsedSettings.appearance.darkMode);
        setOfflineMode(parsedSettings.learning.offlineMode);
        setPronunciationAccent(parsedSettings.pronunciation.accent);
        setTranslationLanguage(parsedSettings.translation.language);
        setReminderTime(parsedSettings.notifications.reminderTime);
        
        // Update new state variables
        setShowPronunciation(parsedSettings.pronunciation.enabled);
        setShowTranslation(parsedSettings.translation.enabled);
        setShowGrammar(parsedSettings.grammar.enabled);
        setShowConjugations(parsedSettings.grammar.showConjugations);
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);
  
  // Save settings when they change
  const saveSettings = () => {
    const updatedSettings: UserSettings = {
      pronunciation: {
        enabled: showPronunciation,
        volume: pronunciationVolume[0],
        accent: pronunciationAccent
      },
      grammar: {
        enabled: showGrammar,
        showConjugations: showConjugations
      },
      translation: {
        enabled: showTranslation,
        language: translationLanguage
      },
      appearance: {
        darkMode: darkModeEnabled,
        textSize: "medium", // Default value
        fontStyle: "system" // Default value
      },
      notifications: {
        enabled: notificationsEnabled,
        reminderTime: reminderTime,
        weeklyReport: true, // Default value
        achievements: true // Default value
      },
      learning: {
        dailyGoal: dailyGoal,
        cefrLevel: "b1", // Default value
        offlineMode: offlineMode
      }
    };
    
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Customize your learning experience with personalized preferences.
        </p>
      </div>

      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Learning Settings Tab */}
        <TabsContent value="learning" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Configure your learning style and curriculum preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CEFR Level Preference */}
              <div className="space-y-1.5">
                <Label htmlFor="cefr-level">Current CEFR Level</Label>
                <Select defaultValue="b1">
                  <SelectTrigger id="cefr-level">
                    <SelectValue placeholder="Select your proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a1">A1 - Beginner</SelectItem>
                    <SelectItem value="a2">A2 - Elementary</SelectItem>
                    <SelectItem value="b1">B1 - Intermediate</SelectItem>
                    <SelectItem value="b2">B2 - Upper Intermediate</SelectItem>
                    <SelectItem value="c1">C1 - Advanced</SelectItem>
                    <SelectItem value="c2">C2 - Proficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Daily Learning Goal */}
              <div className="space-y-1.5">
                <Label htmlFor="daily-goal">Daily Goal (minutes)</Label>
                <Select value={dailyGoal} onValueChange={setDailyGoal}>
                  <SelectTrigger id="daily-goal">
                    <SelectValue placeholder="Select daily learning time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Word Analysis Features */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">Word Analysis Features</h3>
                
                {/* Show Word Pronunciation */}
                <div className="flex items-center justify-between space-y-0 mb-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-pronunciation">Show Pronunciation</Label>
                    <p className="text-sm text-muted-foreground">
                      Display IPA pronunciation for words
                    </p>
                  </div>
                  <Switch
                    id="show-pronunciation"
                    checked={showPronunciation}
                    onCheckedChange={setShowPronunciation}
                  />
                </div>
                
                {/* Show Word Translation */}
                <div className="flex items-center justify-between space-y-0 mb-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-translation">Show Translation</Label>
                    <p className="text-sm text-muted-foreground">
                      Display translations directly below words
                    </p>
                  </div>
                  <Switch
                    id="show-translation"
                    checked={showTranslation}
                    onCheckedChange={setShowTranslation}
                  />
                </div>
                
                {/* Show Grammar Details */}
                <div className="flex items-center justify-between space-y-0 mb-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-grammar">Show Grammar Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Display parts of speech and grammatical details
                    </p>
                  </div>
                  <Switch
                    id="show-grammar"
                    checked={showGrammar}
                    onCheckedChange={setShowGrammar}
                  />
                </div>
                
                {/* Show Conjugation Tables */}
                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-conjugations">Show Conjugation Tables</Label>
                    <p className="text-sm text-muted-foreground">
                      Display verb conjugation tables in word details
                    </p>
                  </div>
                  <Switch
                    id="show-conjugations"
                    checked={showConjugations}
                    onCheckedChange={setShowConjugations}
                  />
                </div>
              </div>

              {/* Translation Language */}
              <div className="space-y-1.5 pt-4 border-t">
                <Label htmlFor="translation-language">Translation Language</Label>
                <Select 
                  value={translationLanguage} 
                  onValueChange={setTranslationLanguage}
                >
                  <SelectTrigger id="translation-language">
                    <SelectValue placeholder="Select translation language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pronunciation Accent */}
              <div className="space-y-1.5">
                <Label htmlFor="pronunciation-accent">Spanish Accent</Label>
                <Select 
                  value={pronunciationAccent} 
                  onValueChange={setPronunciationAccent}
                >
                  <SelectTrigger id="pronunciation-accent">
                    <SelectValue placeholder="Select Spanish accent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spain">Spain (European)</SelectItem>
                    <SelectItem value="mexico">Mexico</SelectItem>
                    <SelectItem value="argentina">Argentina</SelectItem>
                    <SelectItem value="colombia">Colombia</SelectItem>
                    <SelectItem value="universal">Universal Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pronunciation Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pronunciation-volume">Pronunciation Volume</Label>
                  <span className="text-sm text-muted-foreground">{pronunciationVolume}%</span>
                </div>
                <Slider
                  id="pronunciation-volume"
                  defaultValue={pronunciationVolume}
                  max={100}
                  step={1}
                  onValueChange={setPronunciationVolume}
                  className="w-full"
                />
              </div>

              {/* Offline Mode */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="offline-mode">Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Download content for offline learning
                  </p>
                </div>
                <Switch
                  id="offline-mode"
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                />
              </div>
              
              {/* Save Button */}
              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button onClick={saveSettings}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings Tab */}
        <TabsContent value="appearance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the visual appearance of your learning interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme for low-light environments
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkModeEnabled}
                  onCheckedChange={setDarkModeEnabled}
                />
              </div>

              {/* Text Size */}
              <div className="space-y-1.5">
                <Label htmlFor="text-size">Text Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="text-size">
                    <SelectValue placeholder="Select text size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xlarge">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Style */}
              <div className="space-y-1.5">
                <Label htmlFor="font-style">Font Style</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="font-style">
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans">Sans-serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                    <SelectItem value="dyslexic">Dyslexic-friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive learning reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily notifications to remind you to practice
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              {/* Reminder Time */}
              <div className="space-y-1.5">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <input
                    type="time"
                    id="reminder-time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Weekly Progress Report */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-report">Weekly Progress Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a summary of your learning progress each week
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  defaultChecked={true}
                />
              </div>

              {/* Achievement Notifications */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="achievement-notifications">Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you earn badges and complete milestones
                  </p>
                </div>
                <Switch
                  id="achievement-notifications"
                  defaultChecked={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and data preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Profile */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Display Name</Label>
                <input
                  id="name"
                  defaultValue="Spanish Learner"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  defaultValue="learner@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Data Synchronization */}
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-data">Sync Learning Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Synchronize your progress across all your devices
                  </p>
                </div>
                <Switch
                  id="sync-data"
                  defaultChecked={true}
                />
              </div>

              <div className="space-y-1.5 pt-4">
                <Button className="w-full sm:w-auto" variant="outline">Export Learning Data</Button>
              </div>

              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Permanently delete your account and all your data.</span>
                  <Button variant="destructive" size="sm" className="sm:ml-auto">
                    Delete Account
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Details about the application version and environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:gap-12">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium">Version:</span>
                    <span className="text-sm text-neutral-600">2.0.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium">Environment:</span>
                    <span className="text-sm text-neutral-600">development</span>
                  </div>
                </div>
                
                <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Application Information</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm">Spanish Learning Application</p>
                    <p className="text-xs text-blue-600 mt-1">Version 2.0.0</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
