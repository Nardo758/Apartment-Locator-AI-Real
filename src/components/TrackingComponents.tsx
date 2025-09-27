import React, { useEffect } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

interface TrackingWrapperProps {
  children: React.ReactNode;
  componentName: string;
  pageName?: string;
  trackOnMount?: boolean;
}

export const TrackingWrapper: React.FC<TrackingWrapperProps> = ({ 
  children, 
  componentName, 
  pageName, 
  trackOnMount = true 
}) => {
  const { trackFeatureUsage } = useUserTracking({
    pageContext: pageName,
    componentContext: componentName
  });

  useEffect(() => {
    if (trackOnMount) {
      trackFeatureUsage('component_mount', {
        component_name: componentName,
        page_name: pageName
      });
    }
  }, [componentName, pageName, trackOnMount, trackFeatureUsage]);

  return <>{children}</>;
};

interface ClickTrackingProps {
  onClick?: () => void;
  children: React.ReactNode;
  trackingId: string;
  trackingData?: Record<string, unknown>;
}

export const ClickTracking: React.FC<ClickTrackingProps> = ({
  onClick,
  children,
  trackingId,
  trackingData
}) => {
  const { trackButtonClick } = useUserTracking();

  const handleClick = () => {
    trackButtonClick(trackingId, trackingData ?? {});
    onClick?.();
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};