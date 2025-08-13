import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Property } from '../data/mockData';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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
      {/* Header with LIVE AI badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">🧠 AI Property Recommendations</span>
          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
            LIVE AI
          </div>
        </div>
      </div>

      {/* Property Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {property.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin size={14} className="mr-1" />
            {property.address}, {property.city}, {property.state}
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getAvailabilityBadgeColor(property.availabilityType)}`}>
              {property.availability}
            </div>
            <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
              {property.matchScore}% Match
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground line-through mb-1">
          ${property.originalPrice.toLocaleString()}/mo
        </div>
        <div className="text-2xl font-bold text-cyan-400 mb-1">
          ${property.aiPrice.toLocaleString()}/mo
        </div>
        <div className="text-lg text-cyan-300 mb-2">
          ${property.effectivePrice.toLocaleString()}/mo effective
        </div>
        <div className="text-xs text-muted-foreground">
          with concessions
        </div>
      </div>

      {/* Savings Badge */}
      <div className="flex items-center justify-end mb-4">
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-medium border border-green-500/30">
          Save ${property.savings}/mo
        </div>
      </div>

      {/* AI Concession Strategy */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-pink-400">🧠</span>
            <span className="text-sm font-medium text-foreground">AI Concession Strategy</span>
          </div>
          <span className="text-xs text-cyan-400 font-medium">{property.successRate}% Success Rate</span>
        </div>
        
        <div className="space-y-2">
          {property.concessions.map((concession, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getProbabilityColor(concession.color)}`}></div>
                <span className="text-sm text-foreground font-medium">{concession.type}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400">{concession.probability}%</div>
                <div className="text-sm font-medium text-cyan-300">{concession.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>2 bed • 2 bath • 1,150 sqft</span>
          <span>• Pool • Gym • Pet OK</span>
        </div>
        
        {/* Commute Times */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {property.commutes.map((commute, index) => (
            <div key={index} className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">
                {commute.location.charAt(0)}
              </div>
              <span>{commute.location}: {commute.time}</span>
            </div>
          ))}
        </div>

        {/* Success Rate Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
          <div 
            className="bg-cyan-400 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${property.successRate}%` }}
          ></div>
        </div>
        <div className="text-right text-xs text-cyan-400 font-medium">
          {property.successRate}% Success Rate
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button 
          className="flex-1 btn-primary text-sm"
          onClick={() => navigate(`/generate-offer?property=${property.id}`)}
        >
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