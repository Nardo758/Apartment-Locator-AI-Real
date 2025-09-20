import React, { useState, useEffect } from 'react';
import { ModernDashboard } from './ModernDashboard';
import { MobileDashboard } from './MobileDashboard';
import { useIsMobile } from '@/hooks/use-mobile';

// Fixed: Use useIsMobile instead of useMediaQuery

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
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (forceView === 'auto') {
      setViewMode(isMobile ? 'mobile' : 'desktop');
    } else {
      setViewMode(forceView === 'mobile' ? 'mobile' : 'desktop');
    }
  }, [isMobile, forceView]);

  if (viewMode === 'mobile') {
    return <MobileDashboard className={className} />;
  }

  return <ModernDashboard className={className} userRole={userRole} />;
};

export default ResponsiveDashboard;