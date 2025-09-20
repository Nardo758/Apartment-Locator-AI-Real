import React from 'react';
import { designSystem } from '@/lib/design-system';
import { ModernCard } from './ModernCard';

interface MetricData {
  title: string;
  value: string | number;
  change?: number | string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
}

interface AnimatedMetricsProps {
  metrics: MetricData[];
  columns?: 2 | 3 | 4;
  animate?: boolean;
  className?: string;
}

export const AnimatedMetrics: React.FC<AnimatedMetricsProps> = ({
  metrics,
  columns = 4,
  animate = true,
  className = ''
}) => {
  const getGridClasses = () => {
    switch (columns) {
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 4:
        return designSystem.layouts.gridFour;
      default:
        return designSystem.layouts.gridFour;
    }
  };

  const formatChange = (change: number | string) => {
    if (typeof change === 'number') {
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }
    return String(change);
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {metrics.map((metric, index) => (
        <ModernCard
          key={metric.title}
          hover={true}
          animate={animate}
          animationDelay={animate ? index * 100 : 0}
          className="relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            {metric.icon && (
              <div className={metric.color || designSystem.colors.primary}>
                {metric.icon}
              </div>
            )}
            {metric.change && (
              <span className={`${designSystem.typography.labelSmall} px-2 py-1 bg-gray-100 rounded-full`}>
                {formatChange(metric.change)}
              </span>
            )}
          </div>
          
          <div className={`${designSystem.typography.label} mb-1`}>
            {metric.title}
          </div>
          
          <div className={`${designSystem.typography.subheadingLarge} font-bold mb-1`}>
            {metric.value}
          </div>
          
          {metric.description && (
            <div className={designSystem.typography.caption}>
              {metric.description}
            </div>
          )}
        </ModernCard>
      ))}
    </div>
  );
};

export default AnimatedMetrics;