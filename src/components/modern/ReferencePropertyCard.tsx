import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ReferencePropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    originalPrice: number;
    aiPrice: number;
    savings: number;
    successRate: number;
    vacancy: string;
  };
}

const ReferencePropertyCard: React.FC<ReferencePropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-blue-400 text-sm font-medium">AI-Powered Property Analysis</h3>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 text-xs font-medium">
          LIVE AI
        </Badge>
      </div>

      {/* Property Info */}
      <div className="mb-4">
        <h4 className="text-foreground text-lg font-semibold mb-1">{property.address}</h4>
        <div className="text-red-400 text-sm font-medium">{property.vacancy}</div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-muted-foreground text-lg line-through">
            {formatPrice(property.originalPrice)}/mo
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-green-400 text-2xl font-bold">
            {formatPrice(property.aiPrice)}/mo
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1.5 text-sm font-medium">
            Save {formatPrice(property.savings)}/mo
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <Progress 
          value={property.successRate} 
          className="h-2 bg-slate-700"
        />
      </div>

      {/* Success Rate */}
      <div className="text-right">
        <span className="text-muted-foreground text-sm font-medium">
          {property.successRate}% Success
        </span>
      </div>
    </div>
  );
};

export default ReferencePropertyCard;