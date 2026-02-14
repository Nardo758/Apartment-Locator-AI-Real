/**
 * Browse Scraped Properties Page
 * Main page for viewing all scraped apartment data
 */

import React from 'react';
import Header from '@/components/Header';
import ScrapedPropertiesBrowser from '@/components/ScrapedPropertiesBrowser';

const BrowseScrapedProperties: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Browse Properties</h1>
            <p className="text-muted-foreground mt-2">
              Real-time apartment data from property management systems
            </p>
          </div>
          
          <ScrapedPropertiesBrowser />
        </div>
      </main>
    </div>
  );
};

export default BrowseScrapedProperties;
