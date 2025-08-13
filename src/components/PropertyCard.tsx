import React, { useState } from 'react';
import { MapPin, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Property } from '../data/mockData';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="glass-dark rounded-xl p-6 card-lift animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {property.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin size={14} className="mr-1" />
            {property.address}, {property.city}, {property.state}
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getAvailabilityBadgeColor(property.availabilityType)}`}>
            {property.availability}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text mb-1">
            {property.matchScore}%
          </div>
          <div className="text-xs text-muted-foreground">
            Match Score
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground line-through">
            ${property.originalPrice.toLocaleString()}/mo
          </div>
          <div className="text-xs text-muted-foreground">Original Price</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            ${property.aiPrice.toLocaleString()}/mo
          </div>
          <div className="text-xs text-muted-foreground">AI Price</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold gradient-secondary-text">
            ${property.effectivePrice.toLocaleString()}/mo
          </div>
          <div className="text-xs text-muted-foreground">Effective</div>
        </div>
      </div>

      {/* Savings Badge */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium border border-secondary/30">
          💰 Save ${property.savings}/month
        </div>
      </div>

      {/* Concessions */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
        >
          <span>Concessions Strategy</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {isExpanded && (
          <div className="space-y-2 animate-slide-up">
            {property.concessions.map((concession, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getProbabilityColor(concession.color)}`}></div>
                  <span className="text-sm text-foreground">{concession.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{concession.value}</div>
                  <div className="text-xs text-muted-foreground">{concession.probability}% likely</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {property.features.slice(0, 4).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs border border-primary/30">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Commute Times */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {property.commutes.slice(0, 2).map((commute, index) => (
            <div key={index} className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{commute.location}: {commute.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Success Rate</span>
          <span>{property.successRate}%</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full progress-animate transition-all duration-1000"
            style={{ width: `${property.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="flex-1 btn-primary text-sm">
          <Zap size={14} className="mr-1" />
          Generate AI Offer
        </button>
        <button className="flex-1 btn-secondary text-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;