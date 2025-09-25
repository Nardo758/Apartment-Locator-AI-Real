import React from 'react';

interface StatsCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  gradient?: 'primary' | 'secondary';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  value, 
  label, 
  sublabel, 
  gradient = 'primary',
  className = '' 
}) => {
  return (
    <div className={`glass-dark rounded-xl p-6 card-lift ${className}`}>
      <div className="flex flex-col space-y-2">
        <div className={`text-3xl font-bold ${
          gradient === 'primary' ? 'gradient-text' : 'gradient-secondary-text'
        }`}>
          {value}
        </div>
        <div className="text-sm font-medium text-foreground">
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;