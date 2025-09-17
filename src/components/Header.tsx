import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown, Settings, HelpCircle, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onSignOut?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignOut }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', active: true },
    { path: '/ai-formula', label: 'AI Formula' },
    { path: '/program-ai', label: 'Program AI' },
    { path: '/offers-made', label: 'Offers Made' },
    { path: '/saved-properties', label: 'Saved Properties' },
    { path: '/market-intel', label: 'Market Intel' },
    { path: '/profile', label: 'Profile' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/10c9e4a0-b0e6-4896-884c-68dde07278eb.png" alt="Apartment Locator AI Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold gradient-text">Apartment Locator AI</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
                  to="/contact"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Support
                </Link>
                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Free Plan Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm font-medium text-secondary">Free Plan</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User size={16} className="text-primary-foreground" />
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <Settings size={16} />
                  Profile & Settings
                </Link>
              </DropdownMenuItem>
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
              <DropdownMenuSeparator />
              {onSignOut && (
                <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 text-red-600">
                  <LogOut size={16} />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;