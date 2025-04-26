import { LogOut, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8 bg-primary/20 text-primary">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">Guest User</p>
            <p className="text-xs text-muted-foreground">Not signed in</p>
          </div>
          <button 
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={handleLogin}
          >
            <LogIn className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 bg-primary/20 text-primary">
            {currentUser.photoURL ? (
              <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
            ) : (
              <AvatarFallback>
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="ml-3 truncate">
          <p className="text-sm font-medium text-foreground truncate">{currentUser.displayName || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
        </div>
        <button 
          className="ml-auto text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
