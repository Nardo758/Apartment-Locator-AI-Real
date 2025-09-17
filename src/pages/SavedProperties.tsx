import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { usePropertyState } from '@/contexts/PropertyStateContext';
import { mockProperties } from '@/data/mockData';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const SavedProperties: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteProperties } = usePropertyState();

  const savedPropertiesList = mockProperties.filter(property => 
    favoriteProperties.includes(property.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {savedPropertiesList.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="mx-auto text-muted-foreground" size={64} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No Saved Properties Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Save properties you're interested in to keep track of them and compare options easily.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Browse Properties
            </Button>
          </div>
        ) : (
          // Properties Grid
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Your saved properties are shown below. Click on any property to view details or generate an AI offer.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedPropertiesList.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedProperties;