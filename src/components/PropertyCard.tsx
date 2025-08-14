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
    <div className="glass-dark rounded-xl p-6 card-lift animate-slide-up border border-slate-700/50">
      {/* Property Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {property.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin size={14} className="mr-1" />
            {property.address}, {property.city}, {property.state}
          </div>
          
          {/* Priority Commute Times - Moved Up */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs text-blue-400 font-medium">Work</span>
              </div>
              <span className="text-sm font-semibold text-foreground">18 min</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-xs text-purple-400 font-medium">UT Campus</span>
              </div>
              <span className="text-sm font-semibold text-foreground">15 min</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-green-400 font-medium">Airport</span>
              </div>
              <span className="text-sm font-semibold text-foreground">35 min</span>
            </div>
          </div>
        </div>
        
        {/* Status Badges - Redesigned */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 backdrop-blur">
            72 days vacant
          </div>
          <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/20 backdrop-blur">
            {property.matchScore}% Match
          </div>
        </div>
      </div>

      {/* Pricing Section - More Elegant */}
      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/20 rounded-xl p-4 mb-6 border border-slate-600/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground line-through mb-2">
              ${property.originalPrice.toLocaleString()}/mo
            </div>
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              ${property.aiPrice.toLocaleString()}/mo
            </div>
            <div className="text-lg text-cyan-300 mb-1">
              ${property.effectivePrice.toLocaleString()}/mo effective
            </div>
            <div className="text-xs text-slate-400">
              with concessions
            </div>
          </div>
          
          {/* Savings Stack - Cleaner Design */}
          <div className="text-right space-y-2">
            <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-500/20">
              Save $683/mo
            </div>
            <div className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-500/20">
              + $800 in concessions
            </div>
            <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-semibold border border-cyan-500/20">
              $1,483/mo total
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-medium border border-emerald-500/20">
              $17,796/year saved
            </div>
          </div>
        </div>
      </div>

      {/* AI Concession Strategy - Enhanced */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-pink-400">🧠</span>
            <span className="text-sm font-semibold text-foreground">AI Concession Strategy</span>
          </div>
          <span className="text-sm text-cyan-400 font-semibold">{property.successRate}% Success Rate</span>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-500/5 to-transparent rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
                <span className="text-sm text-foreground font-medium">First Month Free</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-green-400">78%</div>
                <div className="text-sm font-semibold text-cyan-300">$2,350</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500/5 to-transparent rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></div>
                <span className="text-sm text-foreground font-medium">Reduced Deposit</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-yellow-400">65%</div>
                <div className="text-sm font-semibold text-cyan-300">$350</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/5 to-transparent rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
                <span className="text-sm text-foreground font-medium">Waived Fees</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-green-400">82%</div>
                <div className="text-sm font-semibold text-cyan-300">$190</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details - Compact */}
      <div className="mb-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>2 bed • 2 bath • 1,150 sqft</span>
          <span>• Pool • Gym • Pet OK</span>
        </div>

        {/* Success Rate Progress Bar - Refined */}
        <div className="relative">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-green-400 h-1.5 rounded-full transition-all duration-1000 shadow-lg shadow-cyan-400/30"
              style={{ width: `${property.successRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-cyan-400 font-medium mt-2">
            <span>Success Rate</span>
            <span>{property.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Modern Design */}
      <div className="flex gap-3">
        <button 
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          onClick={() => navigate(`/generate-offer?property=${property.id}`)}
        >
          <Zap size={16} />
          Generate AI Offer
        </button>
        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-slate-600">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;