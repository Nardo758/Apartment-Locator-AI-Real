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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const handleViewDetails = () => {
    setSelectedProperty(property);
    navigate(`/property/${property.id}`);
  };

  const handleGenerateOffer = () => {
    setSelectedProperty(property);
    navigate('/generate-offer');
  };

  const getAvailabilityBadgeColor = (type: string) => {
    switch (type) {
      case 'immediate':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'soon':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'waitlist':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProbabilityColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/20 text-green-400';
      case 'yellow':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'orange':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 shadow-xl">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-blue-400 text-sm font-medium">AI-Powered Property Analysis</h3>
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-medium">
          LIVE AI
        </div>
      </div>

      {/* Property Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-foreground text-lg font-semibold">{property.address}</h4>
          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isFavorited 
                ? 'text-red-500 bg-red-500/10 border border-red-500/20' 
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/5'
            }`}
          >
            <Heart size={16} className={isFavorited ? 'fill-current' : ''} aria-hidden="true" />
          </button>
        </div>
        <div className="text-red-400 text-sm font-medium">
          {property.id === '3' ? '67 days vacant' : '72 days vacant'}
        </div>
      </div>

      {/* Pricing - Clean Layout */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-muted-foreground text-lg line-through">
            ${property.originalPrice.toLocaleString()}/mo
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-green-400 text-2xl font-bold">
            ${property.effectivePrice.toLocaleString()}/mo
          </div>
          <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-sm font-medium">
            Save ${(property.id === '3' ? 545 : (property.originalPrice - property.effectivePrice)).toLocaleString()}/mo
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${property.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="text-right mb-6">
        <span className="text-muted-foreground text-sm font-medium">
          {property.successRate}% Success
        </span>
      </div>

      {/* Action Buttons - Clean Design */}
      <div className="flex gap-3">
        <button 
          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          onClick={handleGenerateOffer}
        >
          <Zap size={16} />
          Generate AI Offer
        </button>
        <button 
          className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-slate-600/30"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>

    </div>
  );
};

export default PropertyCard;