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
        {/* Searches */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Searches</span>
            <span className="text-foreground font-medium">{searchesUsed}/{searchesLimit}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(searchesUsed, searchesLimit)}`}
              style={{ width: `${getProgressWidth(searchesUsed, searchesLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* AI Offers */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">AI Offers</span>
            <span className="text-foreground font-medium">{aiOffersUsed}/{aiOffersLimit}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(aiOffersUsed, aiOffersLimit)}`}
              style={{ width: `${getProgressWidth(aiOffersUsed, aiOffersLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* Reports */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Reports</span>
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

      <button className="w-full mt-6 bg-gradient-primary text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <Zap size={16} className="inline mr-2" />
        Upgrade Plan
      </button>
    </div>
  );
};

export default UsageTracker;