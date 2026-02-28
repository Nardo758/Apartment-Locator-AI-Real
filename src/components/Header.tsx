import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Settings, HelpCircle, CreditCard, LogOut, Menu, LogIn, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/useUser';

interface HeaderProps {
  onSignOut?: () => void;
}

const Header = ({ onSignOut }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', active: true },
    { path: '/browse-properties', label: 'Browse Properties' },
    { path: '/market-intel', label: 'Market Intel' },
    { path: '/saved-properties', label: 'My Apartments' },
    { path: '/ai-formula', label: 'AI Formula' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/10c9e4a0-b0e6-4896-884c-68dde07278eb.png" alt="Apartment Locator AI Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Apartment Locator AI</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border pt-4 space-y-2">
                <Link
                  to="/program-ai"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Program Your AI
                </Link>
                <Link
                  to="/billing"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Billing & Plans
                </Link>
                <Link
                  to="/help"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help & Support
                </Link>
                <Link
                  to="/data-export"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Export My Data
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Support
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      onSignOut?.();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-3 py-2 text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Plan Badge - only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">
                {user?.subscriptionTier || 'Free Plan'}
              </span>
            </div>
          )}

          {isAuthenticated ? (
            /* User Menu - Authenticated */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100" data-testid="button-user-menu">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <ChevronDown size={14} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user?.email && (
                  <>
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User size={16} />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/program-ai" className="flex items-center gap-2">
                    <Settings size={16} />
                    Program Your AI
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/billing" className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Billing & Plans
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/data-export" className="flex items-center gap-2">
                    <Settings size={16} />
                    Export My Data
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    logout();
                    onSignOut?.();
                    navigate('/');
                  }} 
                  className="flex items-center gap-2 text-red-600"
                  data-testid="button-sign-out"
                >
                  <LogOut size={16} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Sign In Button - Not Authenticated */
            <Button asChild variant="default" data-testid="button-sign-in">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn size={16} />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;