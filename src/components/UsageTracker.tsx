import React from 'react';
import { Zap } from 'lucide-react';
import { mockUsageData } from '../data/mockData';

const UsageTracker: React.FC = () => {
  const { plan, searchesUsed, searchesLimit, aiOffersUsed, aiOffersLimit, reportsUsed, reportsLimit } = mockUsageData;

  const getProgressWidth = (used: number, limit: number) => {
    return (used / limit) * 100;
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-gradient-secondary';
  };

  return (
    <div className="glass-dark rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Usage</h3>
        <span className="text-sm font-medium text-secondary">{plan}</span>
      </div>

      <div className="space-y-4">
        {/* AI Property Analyses */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">AI Property Analyses</span>
            <span className="text-foreground font-medium">{searchesUsed}/{searchesLimit}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(searchesUsed, searchesLimit)}`}
              style={{ width: `${getProgressWidth(searchesUsed, searchesLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* AI Offers Generated */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">AI Offers Generated</span>
            <span className="text-foreground font-medium">{aiOffersUsed}/{aiOffersLimit}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(aiOffersUsed, aiOffersLimit)}`}
              style={{ width: `${getProgressWidth(aiOffersUsed, aiOffersLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* Automated Outreach */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Automated Outreach</span>
            <span className="text-foreground font-medium">{reportsUsed}/{reportsLimit}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(reportsUsed, reportsLimit)}`}
              style={{ width: `${getProgressWidth(reportsUsed, reportsLimit)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Success Rate Display */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-primary/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Success Rate</span>
          <span className="text-lg font-bold gradient-text">73%</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          AI negotiations this month
        </div>
      </div>

      <button className="w-full mt-6 bg-gradient-primary text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <Zap size={16} className="inline mr-2" />
        🚀 Unlock More AI Power
      </button>
    </div>
  );
};

export default UsageTracker;