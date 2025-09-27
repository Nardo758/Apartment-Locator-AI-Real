import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Zap, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { Property } from '../data/mockData';
import { usePropertyState } from '@/contexts';
import PricingBreakdown from './PricingBreakdown';

interface PropertyCardProps {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const {
        setSelectedProperty,
        favoriteProperties,
        toggleFavorite
    } = usePropertyState();

    const isFavorited = favoriteProperties.includes(property.id);

    const handleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        toggleFavorite(property.id);
    };

    const handleViewDetails = () => {
        setSelectedProperty(property);
        navigate(`/property/${property.id}`);
    };

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={handleCardClick}
        >
            {/* Property Image */}
            <div className="relative">
                <img 
                    src={property.images?.[0] || '/placeholder.svg'} 
                    alt={property.name}
                    className="w-full h-48 object-cover"
                />
                <button
                    onClick={handleFavorite}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <Heart 
                        className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                </button>
                {property.availabilityType === 'soon' && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                        Available Soon
                    </div>
                )}
            </div>

            {/* Property Details */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                    <span className="text-xl font-bold text-green-600">
                        ${property.aiPrice.toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.address}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{property.availability}</span>
                    </div>
                    {property.features?.includes('instant-book') && (
                        <div className="flex items-center text-green-600">
                            <Zap className="w-4 h-4 mr-1" />
                            <span>Instant Book</span>
                        </div>
                    )}
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="mt-4 border-t pt-4">
                        <div className="text-gray-700 mb-4">
                            <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                            <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                            <p><strong>Square Feet:</strong> {property.sqft?.toLocaleString()}</p>
                        </div>
                        
                        <PricingBreakdown 
                            originalPrice={property.originalPrice}
                            aiPrice={property.aiPrice}
                            effectivePrice={property.effectivePrice}
                            concessions={0}
                            successRate={property.successRate}
                            monthlySavings={property.savings}
                        />
                        
                        <button
                            onClick={handleViewDetails}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            View Full Details
                        </button>
                    </div>
                )}

                {/* Expand/Collapse Button */}
                <div className="flex justify-center mt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Show More
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;