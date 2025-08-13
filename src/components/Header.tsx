import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', active: true },
    { path: '/saved', label: 'Saved Properties' },
    { path: '/market-intel', label: 'Market Intel' },
    { path: '/offers', label: 'My Offers' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏠</span>
          <h1 className="text-xl font-bold gradient-text">ApartmentIQ</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Free Plan Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm font-medium text-secondary">Free Plan</span>
          </div>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;