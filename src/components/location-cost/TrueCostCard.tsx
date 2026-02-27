// ============================================
// TRUE COST CARD
// Shows full cost breakdown for a single apartment
// ============================================

import { useState } from 'react';
import { 
  Car, 
  ParkingCircle, 
  ShoppingCart, 
  Dumbbell,
  Train,
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import type { ApartmentLocationCost } from '@/types/locationCost.types';

interface TrueCostCardProps {
  data: ApartmentLocationCost;
  apartmentName?: string;
  showExpanded?: boolean;
  rank?: number;
  isBestValue?: boolean;
}

export function TrueCostCard({ 
  data, 
  apartmentName, 
  showExpanded = false,
  rank,
  isBestValue = false
}: TrueCostCardProps) {
  const [expanded, setExpanded] = useState(showExpanded);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDelta = (amount: number) => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(amount)}`;
  };
  
  const costItems = [
    {
      icon: Car,
      label: 'Commute',
      amount: data.commuteCost.totalMonthly,
      detail: `${data.commuteCost.distanceMiles} mi · ${data.commuteCost.durationMinutes} min each way`,
      colorClass: 'bg-blue-500/20 text-blue-400',
    },
    {
      icon: ParkingCircle,
      label: 'Parking',
      amount: data.parkingCost.estimatedMonthly,
      detail: data.parkingCost.parkingIncluded ? 'Included' : data.parkingCost.source,
      colorClass: 'bg-purple-500/20 text-purple-400',
    },
    {
      icon: ShoppingCart,
      label: 'Grocery trips',
      amount: data.groceryCost.additionalGasCost,
      detail: data.groceryCost.distanceMiles > 0
        ? `${data.groceryCost.nearestGroceryStore.name} · ${data.groceryCost.distanceMiles} mi`
        : `${data.groceryCost.nearestGroceryStore.name}`,
      colorClass: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      icon: Dumbbell,
      label: 'Gym commute',
      amount: data.gymCost.additionalGasCost,
      detail: data.gymCost.nearestGym?.name || 'No gym membership',
      colorClass: 'bg-orange-500/20 text-orange-400',
    },
  ];
  
  const visibleCostItems = expanded 
    ? costItems 
    : costItems.filter(item => item.amount > 0);
  
  return (
    <div className={`glass rounded-xl overflow-hidden transition-all ${
      isBestValue ? 'ring-2 ring-emerald-500/50' : ''
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {rank && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900' :
                rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900' :
                rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                'bg-white/10 text-slate-400'
              }`}>
                {rank}
              </div>
            )}
            <div>
              {apartmentName && (
                <h3 className="font-semibold text-white">{apartmentName}</h3>
              )}
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {data.apartmentAddress}
              </p>
            </div>
          </div>
          
          {isBestValue && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Best Value
            </div>
          )}
        </div>
      </div>
      
      {/* Price Summary */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Base Rent</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(data.baseRent)}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Location Costs</p>
            <p className={`text-lg font-semibold ${data.totalLocationCosts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatDelta(data.totalLocationCosts)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">True Monthly Cost</p>
            <p className="text-3xl font-bold gradient-text">{formatCurrency(data.trueMonthlyCost)}</p>
          </div>
        </div>
        
        {data.vsAverageTrue !== 0 && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            data.vsAverageTrue < 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {data.vsAverageTrue < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>
              {formatDelta(data.vsAverageTrue)} vs average
              {data.vsAverageTrue < 0 && ` · Save ${formatCurrency(Math.abs(data.vsAverageTrue * 12))}/year`}
            </span>
          </div>
        )}
      </div>
      
      {/* Cost Breakdown */}
      <div className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <span>Cost Breakdown</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <div className={`space-y-3 transition-all ${expanded ? '' : 'max-h-32 overflow-hidden'}`}>
          {visibleCostItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${item.colorClass.split(' ')[0]}`}>
                    <Icon className={`w-4 h-4 ${item.colorClass.split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
                <p className={`font-medium ${item.amount > 0 ? 'text-white' : 'text-slate-500'}`}>
                  {item.amount > 0 ? formatDelta(item.amount) : '—'}
                </p>
              </div>
            );
          })}
          
          {data.transitSavings.potentialMonthlySavings > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <Train className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Transit Savings</p>
                  <p className="text-xs text-slate-500">
                    {data.transitSavings.walkingDistanceMinutes} min walk to station
                  </p>
                </div>
              </div>
              <p className="font-medium text-emerald-400">
                -{formatCurrency(data.transitSavings.potentialMonthlySavings)}
              </p>
            </div>
          )}
        </div>
        
        {expanded && data.commuteCost.hoursPerMonth > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-white">
                {data.commuteCost.hoursPerMonth.toFixed(1)} hours/month commuting
              </p>
              <p className="text-xs text-slate-500">
                That's {(data.commuteCost.hoursPerMonth * 12).toFixed(0)} hours per year
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Confidence Indicator */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Estimate confidence:</span>
          <div className="flex gap-1">
            {['high', 'medium', 'low'].map((level, idx) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  (data.confidence === 'high') ||
                  (data.confidence === 'medium' && idx < 2) ||
                  (data.confidence === 'low' && idx < 1)
                    ? data.confidence === 'high' ? 'bg-emerald-500' :
                      data.confidence === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-500 capitalize">{data.confidence}</span>
        </div>
      </div>
    </div>
  );
}

export default TrueCostCard;
