// ============================================
// TRUE COST BADGE
// Small badge to show on PropertyCard
// Shows True Cost and delta vs average
// ============================================

import React from 'react';
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
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs hover:bg-white/10 hover:text-white transition-all"
      >
        <Calculator className="w-3 h-3" />
        <span>Calculate true cost</span>
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
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
          isBestValue 
            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30' 
            : isGoodValue
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-amber-500/10 text-amber-400'
        }`}
      >
        {isBestValue && <Sparkles className="w-3 h-3" />}
        <span>True: {formatCurrency(trueCost)}</span>
      </div>
    );
  }
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
        isBestValue 
          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">True Monthly Cost</span>
        {isBestValue && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Sparkles className="w-3 h-3" />
            Best
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <span className="text-lg font-bold text-white">{formatCurrency(trueCost)}</span>
          {locationCosts > 0 && (
            <span className="text-xs text-slate-500 ml-1">
              (+{formatCurrency(locationCosts)} location)
            </span>
          )}
        </div>
        
        {delta !== undefined && delta !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${
            delta < 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {delta < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            <span>{delta < 0 ? '' : '+'}{formatCurrency(delta)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton loading state
export function TrueCostBadgeSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 animate-pulse">
        <div className="w-3 h-3 bg-white/10 rounded" />
        <div className="w-16 h-3 bg-white/10 rounded" />
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10 animate-pulse">
      <div className="w-24 h-3 bg-white/10 rounded mb-2" />
      <div className="w-20 h-5 bg-white/10 rounded" />
    </div>
  );
}

export default TrueCostBadge;
