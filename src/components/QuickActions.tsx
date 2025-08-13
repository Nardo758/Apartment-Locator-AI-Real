import React from 'react';
import { Search, TrendingUp, Settings } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Search,
      label: 'AI Property Discovery',
      description: 'Find hidden deals',
      gradient: 'bg-gradient-primary'
    },
    {
      icon: TrendingUp,
      label: 'Market Intelligence',
      description: 'Real-time insights',
      gradient: 'bg-gradient-secondary'
    },
    {
      icon: Settings,
      label: 'Concession Strategy',
      description: 'Negotiation tactics',
      gradient: 'bg-gradient-primary'
    }
  ];

  return (
    <div className="glass-dark rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-lg ${action.gradient} flex items-center justify-center`}>
                <IconComponent size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;