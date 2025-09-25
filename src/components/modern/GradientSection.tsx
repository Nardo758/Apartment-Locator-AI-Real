import React from 'react';
import { designSystem } from '@/lib/design-system';

interface GradientSectionProps {
  children: React.ReactNode;
  variant: 'hero' | 'feature' | 'stats' | 'cta' | 'content';
  className?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export const GradientSection: React.FC<GradientSectionProps> = ({
  children,
  variant,
  className = '',
  title,
  subtitle,
  centered = false
}) => {
  const getSectionClasses = () => {
    const baseClasses = `${designSystem.layouts.section} ${className}`;
    
    switch (variant) {
      case 'hero':
        return `relative ${designSystem.backgrounds.hero} overflow-hidden ${baseClasses}`;
      case 'feature':
        return `bg-gray-50 ${baseClasses}`;
      case 'stats':
        return `${designSystem.backgrounds.stats} text-white ${baseClasses}`;
      case 'cta':
        return `${designSystem.backgrounds.stats} text-white ${baseClasses}`;
      case 'content':
        return `bg-white ${baseClasses}`;
      default:
        return `bg-white ${baseClasses}`;
    }
  };

  const getOverlay = () => {
    if (variant === 'hero') {
      return <div className={designSystem.backgrounds.overlay}></div>;
    }
    return null;
  };

  const getHeaderClasses = () => {
    const baseClasses = centered ? 'text-center' : '';
    const marginClasses = designSystem.spacing.marginLarge;
    
    return `${baseClasses} ${marginClasses}`;
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'hero':
        return designSystem.typography.hero;
      case 'stats':
      case 'cta':
        return `${designSystem.typography.heading} text-white`;
      default:
        return designSystem.typography.heading;
    }
  };

  const getSubtitleClasses = () => {
    switch (variant) {
      case 'stats':
      case 'cta':
        return `${designSystem.typography.subheading} text-blue-100`;
      default:
        return designSystem.typography.subheading;
    }
  };

  return (
    <section className={getSectionClasses()}>
      {getOverlay()}
      <div className={`relative ${designSystem.layouts.container}`}>
        {(title || subtitle) && (
          <div className={getHeaderClasses()}>
            {title && (
              <h2 className={getTitleClasses()}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={getSubtitleClasses()}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default GradientSection;