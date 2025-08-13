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
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium border border-red-500/30">
            72 days vacant
          </div>
          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
            {property.matchScore}% Match
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground line-through mb-1">
            ${property.originalPrice.toLocaleString()}/mo
          </div>
          <div className="text-2xl font-bold text-cyan-400 mb-1">
            ${property.aiPrice.toLocaleString()}/mo
          </div>
          <div className="text-lg text-cyan-300 mb-1">
            ${property.effectivePrice.toLocaleString()}/mo effective
          </div>
          <div className="text-xs text-muted-foreground">
            with concessions
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-medium border border-green-500/30">
            Save $683/mo
          </div>
          <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-sm font-medium border border-purple-500/30">
            + $800 in concessions
          </div>
          <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded text-sm font-medium border border-cyan-500/30">
            $1,483/mo total savings
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-xs font-medium border border-emerald-500/30">
            $17,796/year saved
          </div>
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
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
              <span className="text-sm text-foreground font-medium">First Month Free</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-cyan-400">78%</div>
              <div className="text-sm font-medium text-cyan-300">$2,350</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
              <span className="text-sm text-foreground font-medium">Reduced Deposit</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-cyan-400">65%</div>
              <div className="text-sm font-medium text-cyan-300">$350</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
              <span className="text-sm text-foreground font-medium">Waived Fees</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-cyan-400">82%</div>
              <div className="text-sm font-medium text-cyan-300">$190</div>
            </div>
          </div>
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