import React from 'react';
import { Search, TrendingUp, Settings, Target } from 'lucide-react';

interface QuickActionsProps {
  onSearchAreaClick?: () => void;
  syncedSettings?: {
    location: string;
    radius: number;
    maxDriveTime: number;
    pointsOfInterest: Array<{
      id: string;
      name: string;
      address: string;
      maxTime: number;
      transportMode: string;
    }>;
  };
  onSettingsChange?: (settings: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onSearchAreaClick, syncedSettings, onSettingsChange }) => {
  const actions = [
    {
      icon: Target,
      label: 'Search Area Profile',
      description: 'Configure location',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30',
      onClick: onSearchAreaClick
    },
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        {syncedSettings && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Settings synced" />
        )}
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg bg-background/5 hover:bg-background/10 transition-all duration-200 hover:-translate-y-0.5 ${
                action.borderColor ? `border ${action.borderColor}` : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${action.gradient} flex items-center justify-center ${
                action.borderColor ? `border ${action.borderColor}` : ''
              }`}>
                <IconComponent size={20} className={action.borderColor ? "text-blue-400" : "text-primary-foreground"} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Synced Settings Display */}
      {syncedSettings && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="text-xs text-muted-foreground mb-2">Synced Settings:</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Location:</span>
              <span className="text-blue-400">{syncedSettings.location}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Radius:</span>
              <span className="text-purple-400">{syncedSettings.radius}mi</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Max Drive:</span>
              <span className="text-green-400">{syncedSettings.maxDriveTime}min</span>
            </div>
            {syncedSettings.pointsOfInterest.length > 0 && (
              <div className="flex justify-between text-xs">
                <span>POIs:</span>
                <span className="text-yellow-400">{syncedSettings.pointsOfInterest.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;