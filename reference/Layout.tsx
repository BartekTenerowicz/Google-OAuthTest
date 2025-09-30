import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Settings,
  CreditCard,
  Bell,
  User,
  LogOut,
  Scan,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  onAddSubscription?: () => void;
}

const Layout = ({ children, onAddSubscription }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleAddSubscription = () => {
    if (onAddSubscription) {
      onAddSubscription();
    } else {
      navigate('/dashboard');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">Wardn</span>
              </div>
              
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard")}
                  className={cn(
                    "text-gray-600 hover:text-gray-900",
                    isActive("/dashboard") && "text-primary bg-primary/10"
                  )}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/subscriptions")}
                  className={cn(
                    "text-gray-600 hover:text-gray-900",
                    isActive("/subscriptions") && "text-primary bg-primary/10"
                  )}
                >
                  Subscriptions
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/analytics")}
                  className={cn(
                    "text-gray-600 hover:text-gray-900",
                    isActive("/analytics") && "text-primary bg-primary/10"
                  )}
                >
                  Analytics
                </Button>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/ocr")}
                  className="hidden sm:flex"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Receipt
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleAddSubscription}
                  className="shadow-none hover:shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/subscriptions")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;