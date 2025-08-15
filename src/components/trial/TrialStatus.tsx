import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Zap, AlertCircle } from 'lucide-react';
import { TrialStatus as TrialStatusType } from '@/hooks/useTrialManager';

interface TrialStatusProps {
  trialStatus: TrialStatusType;
  timeRemaining: { hours: number; isUrgent: boolean };
  onUpgrade: () => void;
  className?: string;
}

export const TrialStatus: React.FC<TrialStatusProps> = ({ 
  trialStatus, 
  timeRemaining, 
  onUpgrade, 
  className 
}) => {
  const searchesRemaining = trialStatus.searchesLimit - trialStatus.searchesUsed;
  
  const getStatusColor = () => {
    if (searchesRemaining === 0 || timeRemaining.hours === 0) return 'text-destructive';
    if (timeRemaining.isUrgent) return 'text-yellow-400';
    return 'text-secondary';
  };

  const getProgressColor = () => {
    if (searchesRemaining === 0 || timeRemaining.hours === 0) return 'bg-destructive';
    if (timeRemaining.isUrgent) return 'bg-yellow-400';
    return 'bg-secondary';
  };

  const progressWidth = (trialStatus.searchesUsed / trialStatus.searchesLimit) * 100;

  return (
    <div className={`glass-dark rounded-xl p-4 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Free Trial</span>
        </div>
        {timeRemaining.isUrgent && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Limited Time</span>
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="space-y-3 mb-4">
        {/* Queries Remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Searches Remaining</span>
          <span className={`font-bold ${getStatusColor()}`}>
            {searchesRemaining}/{trialStatus.searchesLimit}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Remaining</span>
          </div>
          <span className={`font-medium ${getStatusColor()}`}>
            {timeRemaining.hours > 0 ? `${timeRemaining.hours}h left` : 'Expired'}
          </span>
        </div>
      </div>

      {/* Upgrade Button */}
      {(timeRemaining.isUrgent || searchesRemaining <= 1) && (
        <Button
          onClick={onUpgrade}
          size="sm"
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Now
        </Button>
      )}
    </div>
  );
};