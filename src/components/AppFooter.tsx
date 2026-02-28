import React from 'react';
import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import QuickLinksCard from './QuickLinksCard';

const AppFooter: React.FC = () => {
  return (
    <footer className={`${designSystem.layouts.section} border-t border-white/10 ${designSystem.backgrounds.section}`}>
      <div className={designSystem.layouts.container}>
        <div className={`${designSystem.layouts.grid} ${designSystem.spacing.marginLarge}`}>
          <div className={designSystem.animations.entrance}>
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-6 h-6 text-blue-600" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Apartment Locator AI
              </div>
            </div>
            <p className={`${designSystem.typography.body} mb-4`}>
              AI-powered apartment hunting that saves you time and money.
            </p>
          </div>
          
          <div className={`${designSystem.animations.entrance}`} >
            <h4 className={`font-semibold mb-4 ${designSystem.colors.dark}`}>Product</h4>
            <QuickLinksCard variant="footer" />
          </div>
          
          <div className={`${designSystem.animations.entrance}`} >
            <h4 className={`font-semibold mb-4 ${designSystem.colors.dark}`}>Support</h4>
            <div className={designSystem.spacing.items}>
              <Link to="/help" className={`block text-sm ${designSystem.colors.muted} hover:text-primary ${designSystem.animations.transition}`}>
                Help Center
              </Link>
              <Link to="/contact" className={`block text-sm ${designSystem.colors.muted} hover:text-primary ${designSystem.animations.transition}`}>
                Contact Support
              </Link>
              <Link to="/about" className={`block text-sm ${designSystem.colors.muted} hover:text-primary ${designSystem.animations.transition}`}>
                About Us
              </Link>
            </div>
          </div>
          
          <div className={`${designSystem.animations.entrance}`} >
            <h4 className={`font-semibold mb-4 ${designSystem.colors.dark}`}>Legal</h4>
            <div className={designSystem.spacing.items}>
              <Link to="/terms" className={`block text-sm ${designSystem.colors.muted} hover:text-primary ${designSystem.animations.transition}`}>
                Terms of Service
              </Link>
              <Link to="/privacy" className={`block text-sm ${designSystem.colors.muted} hover:text-primary ${designSystem.animations.transition}`}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className={`text-sm ${designSystem.colors.muted}`}>
            © 2024 Apartment Locator AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;