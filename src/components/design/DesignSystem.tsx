import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Design system color palette
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    900: '#78350f'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    900: '#111827'
  }
};

// Status indicator component
export const StatusIndicator = ({ 
  status, 
  label, 
  size = 'sm' 
}: { 
  status: 'success' | 'warning' | 'danger' | 'info'; 
  label: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const statusConfig = {
    success: { color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-700', bgColor: 'bg-green-50' },
    warning: { color: 'bg-yellow-500', icon: AlertTriangle, textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    danger: { color: 'bg-red-500', icon: AlertTriangle, textColor: 'text-red-700', bgColor: 'bg-red-50' },
    info: { color: 'bg-blue-500', icon: Info, textColor: 'text-blue-700', bgColor: 'bg-blue-50' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: { dot: 'w-2 h-2', icon: 'h-3 w-3', text: 'text-xs', padding: 'px-2 py-1' },
    md: { dot: 'w-3 h-3', icon: 'h-4 w-4', text: 'text-sm', padding: 'px-3 py-2' },
    lg: { dot: 'w-4 h-4', icon: 'h-5 w-5', text: 'text-base', padding: 'px-4 py-3' }
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div className={`inline-flex items-center space-x-2 ${sizeConfig.padding} ${config.bgColor} rounded-full`}>
      <div className={`${sizeConfig.dot} ${config.color} rounded-full animate-pulse`} />
      <Icon className={`${sizeConfig.icon} ${config.textColor}`} />
      <span className={`${sizeConfig.text} font-medium ${config.textColor}`}>{label}</span>
    </div>
  );
};

// Enhanced metric card with better visual hierarchy
export const MetricCardV2 = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  variant = 'default',
  size = 'md',
  onClick
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg',
    minimal: 'bg-gray-50 border-0'
  };

  const sizeClasses = {
    sm: { padding: 'p-4', title: 'text-sm', value: 'text-xl', icon: 'h-5 w-5' },
    md: { padding: 'p-6', title: 'text-sm', value: 'text-2xl', icon: 'h-6 w-6' },
    lg: { padding: 'p-8', title: 'text-base', value: 'text-3xl', icon: 'h-8 w-8' }
  };

  const config = sizeClasses[size];
  const isClickable = !!onClick;

  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02, y: -2 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${variantClasses[variant]} rounded-xl ${config.padding} ${
        isClickable ? 'cursor-pointer' : ''
      } transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${config.title} font-medium ${
            variant === 'gradient' ? 'text-white/80' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`${config.value} font-bold mt-2 ${
            variant === 'gradient' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${
              variant === 'gradient' ? 'text-white/70' : 'text-gray-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          {Icon && (
            <Icon className={`${config.icon} ${
              variant === 'gradient' ? 'text-white/80' : 'text-gray-400'
            }`} />
          )}
          {trend && trendValue && trendIcon && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              variant === 'gradient' 
                ? 'bg-white/20 text-white' 
                : `${trendColor} bg-gray-100`
            }`}>
              {React.createElement(trendIcon, { className: 'h-3 w-3' })}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced alert component with better UX
export const AlertV2 = ({
  type,
  title,
  message,
  action,
  onAction,
  onDismiss,
  timestamp
}: {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  timestamp?: string;
}) => {
  const typeConfig = {
    success: { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      icon: CheckCircle, 
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    warning: { 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200', 
      icon: AlertTriangle, 
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    danger: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      icon: AlertTriangle, 
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    info: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      icon: Info, 
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${config.bg} ${config.border} border rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${config.titleColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${config.messageColor}`}>{message}</p>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {action && onAction && (
            <Button size="sm" variant="outline" onClick={onAction}>
              {action}
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              ×
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Progress indicator with enhanced styling
export const ProgressV2 = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'blue',
  animated = false
}: {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animated?: boolean;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-sm text-gray-600">
              {value}{max !== 100 ? `/${max}` : '%'}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <motion.div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Card with enhanced visual hierarchy
export const CardV2 = ({
  title,
  subtitle,
  children,
  action,
  status,
  variant = 'default',
  className = ''
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
  variant?: 'default' | 'elevated' | 'minimal';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg border-0',
    minimal: 'bg-gray-50 border-0'
  };

  const statusBorder = {
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    danger: 'border-l-4 border-l-red-500',
    info: 'border-l-4 border-l-blue-500'
  };

  return (
    <Card className={`${variantClasses[variant]} ${status ? statusBorder[status] : ''} ${className}`}>
      <CardHeader className={action ? 'flex flex-row items-start justify-between space-y-0' : ''}>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="mt-1">{subtitle}</CardDescription>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Data table with enhanced styling
export const DataTable = ({
  headers,
  rows,
  onRowClick
}: {
  headers: string[];
  rows: any[][];
  onRowClick?: (rowIndex: number) => void;
}) => (
  <div className="overflow-hidden rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {rows.map((row, rowIndex) => (
          <motion.tr
            key={rowIndex}
            whileHover={{ backgroundColor: '#f9fafb' }}
            onClick={() => onRowClick?.(rowIndex)}
            className={onRowClick ? 'cursor-pointer' : ''}
          >
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {cell}
              </td>
            ))}
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Loading skeleton
export const LoadingSkeleton = ({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

// Typography scale
export const Typography = {
  h1: 'text-4xl font-bold text-gray-900',
  h2: 'text-3xl font-bold text-gray-900',
  h3: 'text-2xl font-bold text-gray-900',
  h4: 'text-xl font-semibold text-gray-900',
  h5: 'text-lg font-semibold text-gray-900',
  h6: 'text-base font-semibold text-gray-900',
  body: 'text-base text-gray-700',
  small: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500'
};

// Spacing scale
export const spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  '2xl': 'space-y-12'
};