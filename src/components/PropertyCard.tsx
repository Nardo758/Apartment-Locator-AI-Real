import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../data/mockData';
import { usePropertyState } from '../contexts/PropertyStateContext';
import { toast } from '@/hooks/use-toast';
import CompactApartmentCard from './CompactApartmentCard';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const { 
    setSelectedProperty, 
    favoriteProperties, 
    setFavoriteProperties 
  } = usePropertyState();

  const isFavorited = favoriteProperties.includes(property.id);

  const handleFavorite = (id: string) => {
    if (isFavorited) {
      setFavoriteProperties(favoriteProperties.filter(propId => propId !== id));
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites"
      });
    } else {
      setFavoriteProperties([...favoriteProperties, id]);
      toast({
        title: "Added to favorites",
        description: "Property saved to your favorites"
      });
    }
  };

  const handleViewDetails = () => {
    setSelectedProperty(property);
    navigate(`/property/${property.id}`);
  };

  const handleShare = (id: string) => {
    // Implementation for sharing functionality
    toast({
      title: "Link copied",
      description: "Property link copied to clipboard"
    });
  };

  // Convert Property to ApartmentData format
  const apartmentData = {
    id: property.id,
    name: property.name,
    address: `${property.address}, ${property.city}, ${property.state}`,
    price: property.effectivePrice,
    bedrooms: 2, // Mock data
    bathrooms: 2, // Mock data
    sqft: 1150, // Mock data
    aiMatchScore: property.matchScore,
    combinedScore: property.matchScore,
    locationScore: 92,
    budgetMatch: property.effectivePrice <= 2500,
    amenityMatch: true,
    lifestyleMatch: true,
    isTopPick: property.matchScore >= 85
  };

  return (
    <CompactApartmentCard
      apartment={apartmentData}
      onFavorite={handleFavorite}
      onViewDetails={handleViewDetails}
      onShare={handleShare}
      isFavorited={isFavorited}
    />
  );
};

export default PropertyCard;