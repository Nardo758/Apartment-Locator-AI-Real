import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  PortfolioSummaryWidget,
  PropertyFilters,
  PropertyCard,
  type PropertyFilterOptions
} from '@/components/landlord';
import { Button } from '@/components/ui/button';
import { Plus, Download, Settings } from 'lucide-react';
import { getAuthToken } from '@/lib/authHelpers';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  marketAvgRent: number;
  vacancyRisk: 'low' | 'medium' | 'high';
  daysVacant?: number;
  lastUpdated: string;
  competitorConcessions: Array<{
    property: string;
    type: string;
    value: string;
  }>;
  recommendation?: string;
  status: 'occupied' | 'vacant';
  leaseEndDate?: string;
  tenant?: string;
  pricingRecommendation?: {
    type: 'increase' | 'decrease' | 'hold';
    amount?: number;
    confidence: number;
    reasoning: string;
    expectedImpact?: string;
  };
  competitorComparison?: Array<{
    propertyName: string;
    distance: number;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    concessions: string[];
    occupancyRate?: number;
  }>;
  competitionSetName?: string;
  yearBuilt?: number;
}

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilterOptions>({
    status: 'all',
    vacancyRisk: 'all',
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [competitionSets, setCompetitionSets] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchProperties();
    fetchCities();
    fetchCompetitionSets();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.vacancyRisk && filters.vacancyRisk !== 'all') params.append('vacancyRisk', filters.vacancyRisk);
      if (filters.competitionSet) params.append('competitionSetId', filters.competitionSet);

      const token = getAuthToken();
      const response = await fetch(`/api/landlord/properties?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/landlord/properties/cities', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableCities(data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCompetitionSets = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/competition-sets', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setCompetitionSets(data.sets || []);
      }
    } catch (error) {
      console.error('Error fetching competition sets:', error);
    }
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/landlord/properties/${propertyId}/edit`);
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/landlord/properties/${propertyId}`);
  };

  const handleAddProperty = () => {
    navigate('/landlord/properties/new');
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Export data');
  };

  const handleSettings = () => {
    navigate('/landlord/settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Portfolio Management
            </h1>
            <p className="text-white/60">
              Monitor your properties, track competition, and optimize pricing
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleSettings}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              onClick={handleAddProperty}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-6">
          <PortfolioSummaryWidget />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableCities={availableCities}
              availableCompetitionSets={competitionSets}
              resultCount={properties.length}
            />
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No properties found
                </h3>
                <p className="text-white/60 mb-6">
                  {Object.keys(filters).some(k => filters[k as keyof PropertyFilterOptions] && filters[k as keyof PropertyFilterOptions] !== 'all')
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first property'}
                </p>
                <Button
                  onClick={handleAddProperty}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Property
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onEdit={handleEditProperty}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
