/**
 * Blurred Property Card with Prominent Savings Display
 * Shows savings amount prominently to incentivize upgrade
 * Hides detailed information behind blur + upgrade button
 */

import React from 'react';
import { Lock, DollarSign, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlurredPropertyCardProps {
  savings?: number; // Monthly savings amount
  totalSavings?: number; // Total savings over lease term
  score?: number; // AI match score
  rank?: number; // Position in results (e.g., #3)
  leaseTerm?: number; // Months, default 12
  onUpgrade: () => void;
  className?: string;
}

export const BlurredPropertyCard: React.FC<BlurredPropertyCardProps> = ({
  savings = 0,
  totalSavings,
  score = 85,
  rank,
  leaseTerm = 12,
  onUpgrade,
  className = '',
}) => {
  const calculatedTotalSavings = totalSavings || (savings * leaseTerm);
  
  return (
    <Card className={`relative overflow-hidden border-2 border-primary/30 ${className}`}>
      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-4 left-4 z-20">
          <Badge 
            variant="secondary" 
            className="text-sm font-bold bg-primary text-primary-foreground"
          >
            #{rank}
          </Badge>
        </div>
      )}
      
      {/* Main Content - Blurred */}
      <div className="relative">
        {/* Blurred Background Content */}
        <div className="filter blur-md pointer-events-none select-none">
          <CardContent className="p-6 space-y-4">
            {/* Mock property details */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
            
            {/* Mock details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
            
            {/* Mock description */}
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </CardContent>
        </div>
        
        {/* Prominent Savings Overlay - NOT Blurred */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 text-center space-y-6 p-8 max-w-md">
            {/* Sparkle Effect */}
            <div className="absolute -top-4 -right-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-pulse delay-300">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            
            {/* Score Badge */}
            {score && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-bold text-lg shadow-lg">
                <TrendingDown className="w-5 h-5" />
                {score}% AI Match
              </div>
            )}
            
            {/* Giant Savings Amount */}
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">
                Potential Savings
              </div>
              <div className="space-y-1">
                {/* Monthly Savings */}
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <span className="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {savings.toLocaleString()}
                  </span>
                </div>
                <div className="text-xl font-semibold text-muted-foreground">
                  per month
                </div>
              </div>
              
              {/* Total Savings */}
              <div className="pt-2 border-t border-border inline-block px-6">
                <div className="text-2xl font-bold text-primary">
                  ${calculatedTotalSavings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  total over {leaseTerm} months
                </div>
              </div>
            </div>
            
            {/* Lock Icon */}
            <div className="flex items-center justify-center">
              <div className="p-4 bg-muted rounded-full">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            
            {/* Upgrade CTA */}
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground font-medium">
                Unlock full details to see how you can save
              </div>
              <Button 
                onClick={onUpgrade}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Unlock Property Details
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div className="text-xs text-muted-foreground">
                See address, contact info, move-in specials & more
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradient Fade at Edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
      </div>
    </Card>
  );
};

export default BlurredPropertyCard;
