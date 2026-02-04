// ============================================
// TRUE COST BADGE - Landing Page Style
// Shows True Cost prominently with gradient
// Matches LandingSSRSafe.tsx aesthetic
// ============================================

import { TrendingDown, TrendingUp, Sparkles, Calculator } from 'lucide-react';

interface TrueCostBadgeProps {
  trueCost?: number;
  baseRent?: number;
  delta?: number; // vs average
  rank?: number;
  compact?: boolean;
  onClick?: () => void;
}

export function TrueCostBadge({ 
  trueCost, 
  baseRent,
  delta, 
  rank,
  compact = false,
  onClick 
}: TrueCostBadgeProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // No data yet - show prompt to set up
  if (!trueCost) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-600 text-sm hover:from-blue-100 hover:to-purple-100 transition-all"
      >
        <Calculator className="w-4 h-4" />
        <span className="font-medium">Calculate True Cost</span>
      </button>
    );
  }
  
  const locationCosts = trueCost - (baseRent || 0);
  const isGoodValue = delta !== undefined && delta < 0;
  const isBestValue = rank === 1;
  
  if (compact) {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] bg-white shadow-md border ${
          isBestValue 
            ? 'border-green-500' 
            : 'border-gray-200'
        }`}
      >
        {/* Base Rent - Small and muted */}
        {baseRent && (
          <div className="text-xs text-gray-500 line-through">
            Base: {formatCurrency(baseRent)}
          </div>
        )}
        
        {/* TRUE COST - Large with gradient */}
        <div className="flex items-baseline gap-1">
          {isBestValue && <Sparkles className="w-4 h-4 text-green-500" />}
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {formatCurrency(trueCost)}
          </span>
          <span className="text-sm text-gray-600">/mo</span>
        </div>
        
        {/* Savings badge */}
        {isGoodValue && delta && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 mt-1">
            <TrendingDown className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              Saves {formatCurrency(Math.abs(delta))}/mo
            </span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl cursor-pointer transition-all hover:rotate-1 bg-white shadow-2xl ${
        isBestValue 
          ? 'border-2 border-green-500' 
          : 'border border-gray-200'
      }`}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="flex items-center gap-1 text-sm text-green-600 font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Best Value
        </div>
      )}
      
      {/* Base Rent - Small */}
      {baseRent && (
        <div className="text-sm text-gray-500 line-through mb-1">
          Base: {formatCurrency(baseRent)}/mo
        </div>
      )}
      
      {/* TRUE COST - HERO ELEMENT */}
      <div className="mb-2">
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {formatCurrency(trueCost)}
        </div>
        <div className="text-lg text-gray-600">/month</div>
      </div>
      
      {/* Location Costs Breakdown */}
      {locationCosts > 0 && (
        <div className="text-sm text-gray-600 mb-3">
          +{formatCurrency(locationCosts)} location costs
        </div>
      )}
      
      {/* Savings Badge - Green */}
      {isGoodValue && delta && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">
            Saves {formatCurrency(Math.abs(delta))}/mo vs others
          </span>
        </div>
      )}
      
      {/* Above Average Warning */}
      {!isGoodValue && delta && delta > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-600 font-medium">
            {formatCurrency(delta)}/mo above average
          </span>
        </div>
      )}
    </div>
  );
}

// Skeleton loading state
export function TrueCostBadgeSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="inline-flex flex-col items-start px-3 py-2 rounded-lg bg-white shadow-md animate-pulse">
        <div className="w-20 h-3 bg-gray-200 rounded mb-1" />
        <div className="w-24 h-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded" />
      </div>
    );
  }
  
  return (
    <div className="p-6 rounded-2xl bg-white shadow-2xl animate-pulse">
      <div className="w-32 h-3 bg-gray-200 rounded mb-2" />
      <div className="w-40 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded mb-2" />
      <div className="w-28 h-4 bg-gray-200 rounded" />
    </div>
  );
}

export default TrueCostBadge;
