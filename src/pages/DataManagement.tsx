import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import Header from '@/components/Header';
import { ZillowSearchPanel } from '@/components/ZillowSearchPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DataManagement = () => {
  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-8 min-h-screen">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Data Management</h1>
          </div>
          <p className="text-muted-foreground">
            Populate your database with rental property data
          </p>
        </div>

        <div className="space-y-6">
          {/* Zillow Data Import */}
          <ZillowSearchPanel />

          {/* Database Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
              <CardDescription>
                Current state of your property database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the search panel above to fetch and store rental properties in your database.
                The data will be available for all features including market intelligence, location analysis, and property recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
