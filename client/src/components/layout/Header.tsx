import { Menu, HelpCircle, Bell, User, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuButtonClick?: () => void;
}

export default function Header({ onMenuButtonClick }: HeaderProps) {
  const [location, navigate] = useLocation();
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/search':
        return 'Dictionary Search';
      case '/database':
        return 'Database Management';
      case '/import':
        return 'Import Dictionary';
      case '/settings':
        return 'Settings';
      case '/profile':
        return 'User Profile';
      case '/login':
        return 'Login';
      default:
        return 'Spanish-English Dictionary';
    }
  };
  
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <button 
          type="button" 
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={onMenuButtonClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Page Title */}
        <h1 className="text-lg font-medium text-foreground">{getPageTitle()}</h1>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {currentUser.displayName || currentUser.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
