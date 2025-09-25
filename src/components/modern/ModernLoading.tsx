import React from 'react';
import { designSystem } from '@/lib/design-system';

interface ModernLoadingProps {
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  className?: string;
}

export const ModernLoading: React.FC<ModernLoadingProps> = ({
  title = 'Apartment Locator AI',
  subtitle = 'Loading...',
  size = 'medium',
  fullScreen = false,
  className = ''
}) => {
  const getContainerClasses = () => {
    let classes = 'flex items-center justify-center text-center';
    
    if (fullScreen) {
      classes += ` ${designSystem.backgrounds.hero} min-h-screen`;
    }
    
    return `${classes} ${className}`;
  };

  const getSpinnerClasses = () => {
    const baseClasses = 'border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4';
    
    switch (size) {
      case 'small':
        return `w-8 h-8 ${baseClasses}`;
      case 'medium':
        return `w-12 h-12 ${baseClasses}`;
      case 'large':
        return `w-16 h-16 ${baseClasses}`;
      default:
        return `w-12 h-12 ${baseClasses}`;
    }
  };

  const getTitleClasses = () => {
    switch (size) {
      case 'small':
        return 'text-lg font-bold text-gray-900';
      case 'medium':
        return 'text-2xl font-bold text-gray-900';
      case 'large':
        return 'text-3xl font-bold text-gray-900';
      default:
        return 'text-2xl font-bold text-gray-900';
    }
  };

  const getSubtitleClasses = () => {
    switch (size) {
      case 'small':
        return 'text-gray-600';
      case 'medium':
        return 'text-gray-600 mt-2';
      case 'large':
        return 'text-lg text-gray-600 mt-2';
      default:
        return 'text-gray-600 mt-2';
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div>
        <div className={getSpinnerClasses()}></div>
        <h1 className={getTitleClasses()}>{title}</h1>
        <p className={getSubtitleClasses()}>{subtitle}</p>
      </div>
    </div>
  );
};

export default ModernLoading;