import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PricingData {
  listedPrice: number;
  aiRecommended: number;
  successRate: number;
  concessionsValue: number;
  effectiveCost: number;
  totalSavings: number;
}

const defaultPricingData: PricingData = {
  listedPrice: 2603,
  aiRecommended: 1920,
  successRate: 87,
  concessionsValue: 800,
  effectiveCost: 1483,
  totalSavings: 1120,
};

const PricingBreakdown: React.FC = () => {
  const [viewMode, setViewMode] = useState<'visual' | 'breakdown'>('visual');
  const data = defaultPricingData;

  const formatPrice = (price: number) => `$${price.toLocaleString()}/mo`;

  const VisualCardLayout = () => (
    <div className="max-w-[400px] mx-auto space-y-6">
      {/* Main Card */}
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-10 backdrop-blur-sm">
        {/* Original Price */}
        <div className="text-[#888] text-sm line-through mb-2">
          {formatPrice(data.listedPrice)} listed price
        </div>
        
        {/* AI Recommended Price */}
        <div className="mb-4">
          <div className="text-white text-3xl font-bold mb-2">
            {formatPrice(data.aiRecommended)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#b0b0b0] text-sm">AI Recommended Offer</span>
            <Badge className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs px-2 py-1 rounded-full border-0">
              {data.successRate}% Success
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.1)] my-6"></div>

        {/* Concessions */}
        <div className="mb-6">
          <div className="text-[#4ecdc4] text-sm font-medium mb-1">+ Expected Concessions</div>
          <div className="text-[#4ecdc4] text-xl font-bold">{formatPrice(data.concessionsValue)} value</div>
        </div>

        {/* Final Cost */}
        <div className="bg-[rgba(78,205,196,0.1)] border border-[rgba(78,205,196,0.2)] rounded-xl p-6">
          <div className="text-[#4ecdc4] text-2xl font-bold mb-1">
            {formatPrice(data.effectiveCost)}
          </div>
          <div className="text-[#b0b0b0] text-sm">
            Your effective monthly cost (Save {formatPrice(data.totalSavings)})
          </div>
        </div>
      </div>
    </div>
  );

  const StepByStepLayout = () => (
    <div className="max-w-[400px] mx-auto">
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-10 backdrop-blur-sm">
        <h3 className="text-white text-xl font-bold mb-6">Price Breakdown</h3>
        
        <div className="space-y-4">
          {/* Listed Price */}
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0b0] text-sm">Listed Price</span>
            <span className="text-[#888] line-through">{formatPrice(data.listedPrice)}</span>
          </div>

          {/* AI Recommended */}
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0b0] text-sm">AI Recommended Offer</span>
            <span className="text-[#667eea] font-bold text-lg">{formatPrice(data.aiRecommended)}</span>
          </div>

          {/* Concessions */}
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0b0] text-sm">Concessions Value</span>
            <span className="text-[#4ecdc4] font-bold">-{formatPrice(data.concessionsValue - data.aiRecommended + data.effectiveCost)}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(255,255,255,0.2)] my-4"></div>

          {/* Final Cost */}
          <div className="flex justify-between items-center bg-[rgba(78,205,196,0.1)] rounded-lg p-4 border-t-2 border-[#4ecdc4]">
            <span className="text-white font-medium">Your Effective Cost</span>
            <span className="text-[#4ecdc4] font-bold text-xl">{formatPrice(data.effectiveCost)}</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[#888] text-xs">
            Total savings: {formatPrice(data.totalSavings)} compared to listed price
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-center">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as 'visual' | 'breakdown')}
          className="bg-[rgba(255,255,255,0.05)] rounded-lg p-1"
        >
          <ToggleGroupItem 
            value="visual" 
            className="data-[state=on]:bg-[rgba(255,255,255,0.1)] text-[#b0b0b0] data-[state=on]:text-white"
          >
            Visual Card
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="breakdown" 
            className="data-[state=on]:bg-[rgba(255,255,255,0.1)] text-[#b0b0b0] data-[state=on]:text-white"
          >
            Price Breakdown
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      {viewMode === 'visual' ? <VisualCardLayout /> : <StepByStepLayout />}
    </div>
  );
};

export default PricingBreakdown;