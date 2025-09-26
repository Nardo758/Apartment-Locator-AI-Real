import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { usePropertyState } from '@/contexts';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProperty } = usePropertyState();

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    if (pathSegments.includes('property') && selectedProperty) {
      crumbs.push({
        label: selectedProperty.name,
        path: `/property/${selectedProperty.id}`
      });
    }

    if (pathSegments.includes('generate-offer')) {
      crumbs.push({
        label: 'Generate Offer',
        isActive: true
      });
    }

    // Mark the last item as active if not explicitly set
    if (crumbs.length > 0 && !crumbs[crumbs.length - 1].isActive) {
      crumbs[crumbs.length - 1].isActive = true;
    }

    return crumbs;
  }, [location.pathname, selectedProperty]);

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        aria-label="Home"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home size={16} className="mr-1" aria-hidden />
      </button>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={`${item.label}-${item.path ?? index}`}>
          <ChevronRight size={14} className="text-muted-foreground" aria-hidden />
          {item.path && !item.isActive ? (
            <button
              type="button"
              onClick={() => navigate(item.path!)}
              className="text-muted-foreground hover:text-foreground transition-colors max-w-[200px] truncate"
            >
              {item.label}
            </button>
          ) : (
            <span
              aria-current={item.isActive ? 'page' : undefined}
              className={`max-w-[200px] truncate ${
                item.isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;