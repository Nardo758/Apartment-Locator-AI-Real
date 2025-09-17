import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockMarketData } from '../data/mockData';

const MarketIntelligence: React.FC = () => {
  const { medianRent, changePercent, daysOnMarket, occupancyRate, trendingConcessions } = mockMarketData;

  return (
    <div className="glass-dark rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">🤖 Live Market Intel</h3>
      
      {/* Market Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Median Rent</span>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{medianRent}</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp size={12} className="mr-1" />
              {changePercent}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Days on Market</span>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{daysOnMarket}</div>
            <div className="text-xs text-muted-foreground">avg days</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Occupancy Rate</span>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{occupancyRate}%</div>
            <div className="text-xs text-muted-foreground">current</div>
          </div>
        </div>
      </div>

      {/* Trending Concessions */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">🔮 AI Concession Predictions</h4>
        <div className="space-y-2">
          {trendingConcessions.map((concession, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <span className="text-sm text-foreground">{concession.type}</span>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp size={12} className="mr-1" />
                {concession.percentage}
              </div>
            </div>
          ))}
        </div>
        
        {/* AI Prediction */}
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-primary">AI Prediction</span>
          </div>
          <p className="text-xs text-muted-foreground">
            85% chance of 1-month free rent in luxury complexes within 7 days
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-muted-foreground text-center">
          AI updated: 2 minutes ago • Market data: 2 hours ago
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;