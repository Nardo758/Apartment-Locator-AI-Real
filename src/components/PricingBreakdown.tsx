import React from 'react';
import { Badge } from './ui/badge';

interface PricingBreakdownProps {
  originalPrice: number;
  aiPrice: number;
  effectivePrice: number;
  concessions: number;
  successRate: number;
  monthlySavings: number;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  originalPrice,
  aiPrice,
  effectivePrice,
  concessions,
  successRate,
  monthlySavings
}) => {
  return (
    <div className="space-y-4">
      {/* Visual Card Layout */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        {/* Original Price */}
        <div className="text-sm text-slate-400 line-through mb-3">
          ${originalPrice.toLocaleString()}/mo listed price
        </div>
        
        {/* AI Recommended Offer */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            ${aiPrice.toLocaleString()}/mo
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">AI Recommended Offer</span>
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 text-xs"
            >
              {successRate}% Success
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 my-4"></div>

        {/* Expected Concessions */}
        <div className="mb-4">
          <div className="text-sm text-teal-400 font-medium mb-1">
            + Expected Concessions
          </div>
          <div className="text-xl font-bold text-teal-400">
            ${concessions} value
          </div>
        </div>

        {/* Final Effective Cost */}
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-teal-400 mb-1">
            ${effectivePrice.toLocaleString()}/mo
          </div>
          <div className="text-sm text-slate-300">
            Your effective monthly cost{' '}
            <span className="text-teal-400 font-medium">
              (Save ${monthlySavings.toLocaleString()}/mo)
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Price Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Listed Price */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-300">Listed Price</span>
            <span className="text-sm text-slate-400 line-through">
              ${originalPrice.toLocaleString()}/mo
            </span>
          </div>
          
          {/* AI Recommended Offer */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-300">AI Recommended Offer</span>
            <span className="text-lg font-bold text-blue-400">
              ${aiPrice.toLocaleString()}/mo
            </span>
          </div>
          
          {/* Concessions Value */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-300">Concessions Value</span>
            <span className="text-lg font-bold text-teal-400">
              -${Math.round(concessions / 12).toLocaleString()}/mo
            </span>
          </div>
          
          {/* Divider */}
          <div className="border-t border-slate-700/50 my-3"></div>
          
          {/* Your Effective Cost */}
          <div className="flex justify-between items-center py-2 bg-teal-500/5 rounded-lg px-3 border border-teal-500/20">
            <span className="text-base font-medium text-white">Your Effective Cost</span>
            <span className="text-xl font-bold text-teal-400">
              ${effectivePrice.toLocaleString()}/mo
            </span>
          </div>
        </div>
        
        {/* Summary note */}
        <div className="text-xs text-slate-400 text-center mt-4">
          Total savings: ${monthlySavings.toLocaleString()}/mo compared to listed price
        </div>
      </div>
    </div>
  );
};

export default PricingBreakdown;