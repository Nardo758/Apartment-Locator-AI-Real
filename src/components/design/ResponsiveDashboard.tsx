import React, { useState, useEffect } from 'react';
import { ModernDashboard } from './ModernDashboard';
import { MobileDashboard } from './MobileDashboard';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * ResponsiveDashboard Component
 * 
 * VERCEL BUILD FIX: This component has been completely rewritten to resolve
 * persistent caching issues with the useMediaQuery import.
 * 
 * Now exclusively uses useIsMobile hook from @/hooks/use-mobile
 */

interface ResponsiveDashboardProps {
  className?: string;
  userRole?: 'owner' | 'manager' | 'analyst';
  forceView?: 'desktop' | 'mobile' | 'auto';
}

export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({ 
  className = "",
  userRole = 'manager',
  forceView = 'auto'
}) => {
  // FIXED: Use useIsMobile instead of useMediaQuery
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (forceView === 'auto') {
      setViewMode(isMobile ? 'mobile' : 'desktop');
    } else {
      setViewMode(forceView);
    }
  }, [isMobile, forceView]);

  // Render mobile version
  if (viewMode === 'mobile') {
    return (
      <div className={`responsive-dashboard mobile-view ${className}`}>
        <MobileDashboard userRole={userRole} />
      </div>
    );
  }

  // Render desktop version (default)
  return (
    <div className={`responsive-dashboard desktop-view ${className}`}>
      <ModernDashboard userRole={userRole} />
    </div>
  );
};

export default ResponsiveDashboard;