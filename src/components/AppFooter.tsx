import React from 'react';
import { Link } from 'react-router-dom';
import QuickLinksCard from './QuickLinksCard';

const AppFooter: React.FC = () => {
  return (
    <footer className="py-8 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/lovable-uploads/e7d43e3a-89d0-41ec-ab1f-3c8f1694401a.png" alt="Apartment Locator AI Logo" className="h-6 w-auto" />
              <div className="text-xl font-bold gradient-text">Apartment Locator AI</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered apartment hunting that saves you time and money.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <QuickLinksCard variant="footer" />
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <div className="space-y-2">
              <Link to="/help" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Support
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Apartment Locator AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;