import React, { useState } from 'react';
import { Brain, TrendingUp, Calculator, Target, Eye } from 'lucide-react';

const AIFormulaExplainer: React.FC = () => {
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const models = [
    {
      id: 'opportunity',
      icon: <Eye className="w-5 h-5" />,
      title: 'Opportunity Detection',
      accuracy: '91%',
      description: 'Identifies high-leverage negotiation opportunities using vacancy pressure, seasonal trends, and landlord flexibility patterns.',
      formula: 'Vacancy_Pressure × 0.25 + Seasonal_Leverage × 0.20 + Financial_Stress × 0.18',
      color: 'cyan'
    },
    {
      id: 'concession',
      icon: <Target className="w-5 h-5" />,
      title: 'Concession Prediction',
      accuracy: '87%',
      description: 'Predicts which concessions have the highest success probability based on property data and landlord patterns.',
      formula: 'ML_Model(historical_success, vacancy_pressure, landlord_patterns)',
      color: 'purple'
    },
    {
      id: 'savings',
      icon: <Calculator className="w-5 h-5" />,
      title: 'Total Savings Calculator',
      accuracy: '94%',
      description: 'Calculates comprehensive savings including AI pricing advantage plus available concessions for maximum monthly and annual savings.',
      formula: 'AI_Savings + Concession_Value = Total_Monthly × 12 = Annual_Savings',
      color: 'green'
    },
    {
      id: 'success',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Success Rate Prediction',
      accuracy: '89%',
      description: 'Determines negotiation success likelihood based on tenant strength, market timing, and property pressure.',
      formula: 'Sigmoid(tenant_strength + market_timing + property_pressure)',
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
      purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
      green: 'border-green-500/30 bg-green-500/5 text-green-400',
      yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  return (
    <div className="glass-dark rounded-xl p-6 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Apartment Locator AI Formula</h3>
          <p className="text-sm text-muted-foreground">6 ML models • 50+ variables • 87% accuracy</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="text-lg font-bold text-cyan-400">200K+</div>
          <div className="text-xs text-muted-foreground">Properties Analyzed</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="text-lg font-bold text-green-400">87%</div>
          <div className="text-xs text-muted-foreground">Prediction Accuracy</div>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="text-lg font-bold text-purple-400">15</div>
          <div className="text-xs text-muted-foreground">Major Markets</div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 pt-4 border-t border-slate-700/30">
        {/* AI Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((model) => (
            <div
              key={model.id}
              className={`rounded-lg p-4 border cursor-pointer transition-all ${
                activeModel === model.id 
                  ? getColorClasses(model.color)
                  : 'border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40'
              }`}
              onClick={() => setActiveModel(activeModel === model.id ? null : model.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeModel === model.id ? 'bg-current/10' : 'bg-slate-700/50'
                }`}>
                  {model.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{model.title}</div>
                  <div className="text-xs text-muted-foreground">{model.accuracy} accuracy</div>
                </div>
              </div>
              {activeModel === model.id && (
                <div className="space-y-2 pt-2 border-t border-current/20">
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                  <div className="bg-slate-900/50 rounded p-2">
                    <code className="text-xs text-cyan-300 font-mono">{model.formula}</code>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Breakdown Formula */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">3-Line Pricing Analysis</h4>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Line 1: Original ($2,350) - AI Predicted ($2,005)</span>
                <span className="text-purple-400 font-mono">= Potential Savings ($345)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Line 2: Concession Value ($200)</span>
                <span className="text-blue-400 font-mono">= Additional Savings ($200)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-600/30 pt-2">
                <span className="text-foreground font-medium">Line 3: Total Monthly ($345 + $200 = $545)</span>
                <span className="text-green-400 font-mono">Annual ($545 × 12 = $6,540)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
            <h5 className="text-sm font-semibold text-green-400 mb-2">Example: South Lamar Residences</h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Price:</span>
                <span className="text-foreground">$2,350/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Predicted Price:</span>
                <span className="text-purple-400">$2,005/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Savings:</span>
                <span className="text-green-400">$345/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concession Value:</span>
                <span className="text-blue-400">$200/mo</span>
              </div>
              <div className="flex justify-between border-t border-slate-600/30 pt-2 font-semibold">
                <span className="text-foreground">Total Monthly Savings:</span>
                <span className="text-green-400">$545/mo</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total Annual Savings:</span>
                <span className="text-green-400">$6,540/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Tiers */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Opportunity Ranking System</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm font-medium text-foreground">Hot Deals</span>
              </div>
              <span className="text-sm text-green-400 font-semibold">90%+ success</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm font-medium text-foreground">Strong Opportunities</span>
              </div>
              <span className="text-sm text-yellow-400 font-semibold">70-89% success</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-sm font-medium text-foreground">Worth Trying</span>
              </div>
              <span className="text-sm text-orange-400 font-semibold">50-69% success</span>
            </div>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-foreground">Real-time Updates</span>
          </div>
          <span className="text-xs text-muted-foreground">Every 6 hours</span>
        </div>
      </div>
    </div>
  );
};

export default AIFormulaExplainer;