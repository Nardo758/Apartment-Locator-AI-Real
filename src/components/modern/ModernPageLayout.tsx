import React from 'react';
import { designSystem } from '@/lib/design-system';
import Header from '@/components/Header';

interface ModernPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backgroundPattern?: 'gradient' | 'hero' | 'simple';
  showHeader?: boolean;
  className?: string;
  headerContent?: React.ReactNode;
}

export const ModernPageLayout: React.FC<ModernPageLayoutProps> = ({
  children,
  title,
  subtitle,
  backgroundPattern = 'gradient',
  showHeader = true,
  className = '',
  headerContent
}) => {
  const getBackgroundClasses = () => {
    switch (backgroundPattern) {
      case 'hero':
        return designSystem.backgrounds.hero;
      case 'gradient':
        return `${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`;
      case 'simple':
        return 'min-h-screen bg-white';
      default:
        return `${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`;
    }
  };

  return (
    <div className={`${getBackgroundClasses()} ${className}`}>
      {showHeader && <Header />}
      
      <main className={`${designSystem.layouts.container} ${showHeader ? designSystem.layouts.header : designSystem.layouts.section}`}>
        {(title || subtitle || headerContent) && (
          <div className={`${designSystem.animations.entrance} ${designSystem.spacing.margin}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                {title && (
                  <h1 className={designSystem.typography.headingGradient}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={designSystem.typography.muted}>
                    {subtitle}
                  </p>
                )}
              </div>
              {headerContent && (
                <div className="mt-4 md:mt-0">
                  {headerContent}
                </div>
              )}
            </div>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default ModernPageLayout;