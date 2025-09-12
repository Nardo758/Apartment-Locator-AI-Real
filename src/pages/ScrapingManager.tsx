/**
 * Scraping Manager Page - Admin interface for managing the scraping system
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrapingDashboard from '@/components/ScrapingDashboard';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';

const ScrapingManager: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Navigation */}
      <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrapingDashboard />
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default ScrapingManager;