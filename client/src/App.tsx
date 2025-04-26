import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Dashboard from "@/pages/Dashboard";
import DictionarySearch from "@/pages/DictionarySearch";
import DatabaseManagement from "@/pages/DatabaseManagement";
import ImportDictionary from "@/pages/ImportDictionary";
import Settings from "@/pages/Settings";
import Learning from "@/pages/Learning";
import LearningNew from "@/pages/LearningNew";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import { useState } from "react";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuButtonClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <AppLayout>
            <LearningNew />
          </AppLayout>
        )}
      </Route>
      <Route path="/dictionary">
        {() => (
          <AppLayout>
            <DictionarySearch />
          </AppLayout>
        )}
      </Route>
      <Route path="/database">
        {() => (
          <AppLayout>
            <DatabaseManagement />
          </AppLayout>
        )}
      </Route>
      <Route path="/import">
        {() => (
          <AppLayout>
            <ImportDictionary />
          </AppLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )}
      </Route>
      <Route path="/login">
        {() => <Login />}
      </Route>
      <Route path="/profile">
        {() => (
          <AppLayout>
            <Profile />
          </AppLayout>
        )}
      </Route>
      <Route>
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
