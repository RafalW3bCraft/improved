import { Link, useLocation } from "wouter";
import { Languages, GraduationCap, Search, Database, Upload, Settings, Bookmark, User, Globe, BookOpen, BarChart } from "lucide-react";
import UserProfile from "@/components/layout/UserProfile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

const NavItem = ({ href, icon, children, active }: NavItemProps) => {
  const [, navigate] = useLocation();
  
  return (
    <div
      onClick={() => navigate(href)}
      className={cn(
        "flex items-center px-3 py-2 rounded-md cursor-pointer group",
        active 
          ? "bg-primary/10 border-l-4 border-primary text-foreground"
          : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      <span className={cn(
        "mr-3", 
        active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
      )}>
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const sidebarContent = (
    <>
      {/* Logo and App Title */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Languages className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">Spanish Learning</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-2 py-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Learning</div>
          
          <NavItem 
            href="/" 
            icon={<BookOpen className="h-5 w-5" />} 
            active={location === '/'}
          >
            Learn & Practice
          </NavItem>
          
          <NavItem 
            href="/dictionary" 
            icon={<Search className="h-5 w-5" />} 
            active={location === '/dictionary'}
          >
            Dictionary
          </NavItem>
          
          <NavItem 
            href="/profile" 
            icon={<User className="h-5 w-5" />} 
            active={location === '/profile'}
          >
            Profile
          </NavItem>
          
          <NavItem 
            href="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            active={location === '/settings'}
          >
            Settings
          </NavItem>
          
          <div className="px-3 py-2 mt-6 text-xs font-semibold text-muted-foreground uppercase">Administration</div>
          
          <NavItem 
            href="/database" 
            icon={<Database className="h-5 w-5" />} 
            active={location === '/database'}
          >
            Database
          </NavItem>
          
          <NavItem 
            href="/import" 
            icon={<Upload className="h-5 w-5" />} 
            active={location === '/import'}
          >
            Import Dictionary
          </NavItem>
        </div>
      </nav>
      
      {/* User Profile */}
      <UserProfile />
    </>
  );
  
  // Render for mobile (inside a sheet component)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Render for desktop (always visible)
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-background border-r border-border">
        {sidebarContent}
      </div>
    </aside>
  );
}
