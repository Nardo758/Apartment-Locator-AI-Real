import React from 'react';
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

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    if (pathSegments.includes('property') && selectedProperty) {
      breadcrumbs.push({
        label: selectedProperty.name,
        path: `/property/${selectedProperty.id}`
      });
    }

    if (pathSegments.includes('generate-offer')) {
      breadcrumbs.push({
        label: 'Generate Offer',
        isActive: true
      });
    }

    // Mark the last item as active
    if (breadcrumbs.length > 0 && !breadcrumbs[breadcrumbs.length - 1].isActive) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home size={16} className="mr-1" />
      </button>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-muted-foreground" />
          {item.path && !item.isActive ? (
            <button
              onClick={() => navigate(item.path!)}
              className="text-muted-foreground hover:text-foreground transition-colors max-w-[200px] truncate"
            >
              {item.label}
            </button>
          ) : (
            <span 
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