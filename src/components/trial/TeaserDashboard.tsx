import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp, Clock, MapPin, Shield, Eye, BarChart3 } from 'lucide-react';
import { TeaserIntelligence } from '@/hooks/useTrialManager';

interface TeaserDashboardProps {
  intelligence: TeaserIntelligence;
  onUpgrade: () => void;
  className?: string;
}

export const TeaserDashboard: React.FC<TeaserDashboardProps> = ({
  intelligence,
  onUpgrade,
  className
}) => {
  const getOpportunityColor = (level: string) => {
    switch (level) {
      case 'EXCEPTIONAL': return 'text-emerald-400 bg-emerald-400/10';
      case 'HIGH': return 'text-secondary bg-secondary/10';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-400/10';
      case 'LOW': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Opportunity Overview Card */}
      <div className="glass-dark rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Opportunity Analysis</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getOpportunityColor(intelligence.opportunityLevel)}`}>
            {intelligence.opportunityLevel} POTENTIAL
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leverage Score */}
          <div className="text-center">
            <div className="text-4xl font-extrabold gradient-text mb-2">
              {intelligence.leverageScore}+
            </div>
            <div className="text-sm text-muted-foreground">Leverage Score</div>
            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
          </div>

          {/* Savings Range */}
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary mb-2">
              ${intelligence.savingsRange.min}-{intelligence.savingsRange.max}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Savings</div>
            <div className="text-xs text-muted-foreground mt-1">potential range</div>
          </div>

          {/* Insights Count */}
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              {intelligence.insightsCount}
            </div>
            <div className="text-sm text-muted-foreground">Detailed Insights</div>
            <div className="text-xs text-muted-foreground mt-1">available</div>
          </div>
        </div>

        {/* Premium Analysis CTA */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Premium Analysis Available</span>
            </div>
            <Button size="sm" onClick={onUpgrade} className="bg-primary hover:bg-primary/90">
              Unlock Full Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Advantages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ownership Analysis */}
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Ownership Analysis</span>
          </div>
          <div className="text-center py-4">
            <div className={`text-2xl mb-2 ${intelligence.advantages.hasOwnershipAdvantage ? 'text-secondary' : 'text-muted-foreground'}`}>
              {intelligence.advantages.hasOwnershipAdvantage ? '✓' : '○'}
            </div>
            <div className="text-sm text-muted-foreground">
              {intelligence.advantages.hasOwnershipAdvantage ? 'Advantage Detected' : 'Neutral'}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onUpgrade}
            className="w-full text-xs border-muted/40 hover:bg-muted/20"
          >
            <Lock className="w-3 h-3 mr-1" />
            View detailed analysis
          </Button>
        </div>

        {/* Timing Advantage */}
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Timing Advantage</span>
          </div>
          <div className="text-center py-4">
            <div className={`text-2xl mb-2 ${intelligence.advantages.hasTimingAdvantage ? 'text-secondary' : 'text-muted-foreground'}`}>
              {intelligence.advantages.hasTimingAdvantage ? '✓' : '○'}
            </div>
            <div className="text-sm text-muted-foreground">
              {intelligence.advantages.hasTimingAdvantage ? 'Optimal Timing' : 'Standard'}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onUpgrade}
            className="w-full text-xs border-muted/40 hover:bg-muted/20"
          >
            <Lock className="w-3 h-3 mr-1" />
            View timing strategy
          </Button>
        </div>

        {/* Market Conditions */}
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Market Conditions</span>
          </div>
          <div className="text-center py-4">
            <div className={`text-lg font-semibold mb-2 ${
              intelligence.advantages.marketCondition === 'Favorable' ? 'text-secondary' :
              intelligence.advantages.marketCondition === 'Challenging' ? 'text-orange-400' :
              'text-muted-foreground'
            }`}>
              {intelligence.advantages.marketCondition}
            </div>
            <div className="text-sm text-muted-foreground">Current Market</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onUpgrade}
            className="w-full text-xs border-muted/40 hover:bg-muted/20"
          >
            <Lock className="w-3 h-3 mr-1" />
            View market data
          </Button>
        </div>
      </div>

      {/* Blurred Insights Section */}
      <div className="glass-dark rounded-xl p-6 border border-white/10 relative overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground mb-4">Premium Insights</h3>
        
        {/* Blurred Insights */}
        <div className="space-y-3 relative">
          {intelligence.blurredInsights.map((insight, index) => (
            <div key={insight.id} className="p-4 rounded-lg bg-muted/20 border border-muted/30">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="font-medium text-foreground">{insight.title}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                This insight reveals {insight.type} factors that could impact your negotiation success...
              </div>
            </div>
          ))}
          
          {/* Blur Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm rounded-lg" />
        </div>

        {/* Center Unlock Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 bg-background/80 rounded-xl border border-white/20 backdrop-blur-md">
            <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Premium Insights Locked</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {intelligence.insightsCount} detailed insights available
            </p>
            <Button onClick={onUpgrade} className="bg-gradient-primary hover:opacity-90">
              <Eye className="w-4 h-4 mr-2" />
              Upgrade to View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};