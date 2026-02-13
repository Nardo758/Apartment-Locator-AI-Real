import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  FileText,
  Grid,
  List,
  Download,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Home,
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/useUser';

type Tab = 'saved' | 'offers';
type ViewMode = 'grid' | 'list';

interface SavedApartment {
  id: string;
  userId: string;
  apartmentId: string;
  notes: string | null;
  rating: number | null;
  createdAt: string;
}

interface Property {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  bathroomsMin: number | null;
  bathroomsMax: number | null;
  images: string[] | null;
  amenities: string[] | null;
  squareFeetMin: number | null;
  squareFeetMax: number | null;
  sentimentScore: number | null;
}

interface SavedPropertyWithDetails {
  saved: SavedApartment;
  property: Property | null;
}

interface Offer {
  id: string;
  propertyName: string;
  propertyId?: string;
  address: string;
  city: string;
  state: string;
  askingRent: number;
  offerAmount: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  sentDate: string;
  responseDate?: string;
  landlordResponse?: string;
  counterOffer?: number;
  nextStep?: string;
}

// Offers stored locally until backend endpoint is built
const OFFERS_STORAGE_KEY = 'renter_offers';

function loadOffers(): Offer[] {
  try {
    const saved = localStorage.getItem(OFFERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function persistOffers(offers: Offer[]) {
  localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
}

export default function SavedAndOffers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [offers, setOffers] = useState<Offer[]>(loadOffers);

  // Persist offers to localStorage when they change
  useEffect(() => {
    persistOffers(offers);
  }, [offers]);

  // Fetch saved apartments from API
  const { data: savedApartments = [], isLoading: loadingSaved, error: savedError, refetch: refetchSaved } = useQuery<SavedApartment[]>({
    queryKey: [`/api/saved-apartments/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch property details for each saved apartment
  const { data: propertyDetails = {} } = useQuery<Record<string, Property>>({
    queryKey: ['property-details', savedApartments.map(s => s.apartmentId)],
    enabled: savedApartments.length > 0,
    queryFn: async () => {
      const details: Record<string, Property> = {};
      const token = localStorage.getItem('auth_token') || '';
      await Promise.all(
        savedApartments.map(async (saved) => {
          try {
            const res = await fetch(`/api/properties/${saved.apartmentId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
              details[saved.apartmentId] = await res.json();
            }
          } catch {
            // Property may have been deleted
          }
        })
      );
      return details;
    },
  });

  // Combine saved apartments with property details
  const savedWithDetails: SavedPropertyWithDetails[] = savedApartments.map(saved => ({
    saved,
    property: propertyDetails[saved.apartmentId] || null,
  }));

  // Remove saved apartment mutation
  const removeMutation = useMutation({
    mutationFn: async (apartmentId: string) => {
      await apiRequest('DELETE', `/api/saved-apartments/${user?.id}/${apartmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/saved-apartments/${user?.id}`] });
    },
  });

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleSelectProperty = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleRemoveSaved = (apartmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeMutation.mutate(apartmentId);
  };

  const handleViewDetails = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property/${propertyId}`);
  };

  const handleMakeOffer = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/generate-offer?propertyId=${propertyId}`);
  };

  const handleExport = useCallback(() => {
    if (savedWithDetails.length === 0) return;
    const rows = savedWithDetails.map(({ saved, property }) => ({
      name: property?.name || 'Unknown',
      address: property?.address || '',
      city: property?.city || '',
      state: property?.state || '',
      rent: property?.minPrice || '',
      bedrooms: property?.bedroomsMin || '',
      bathrooms: property?.bathroomsMin || '',
      notes: saved.notes || '',
      savedDate: new Date(saved.createdAt).toLocaleDateString(),
    }));
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${row[h as keyof typeof row] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-apartments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [savedWithDetails]);

  const handleRemoveOffer = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
  };

  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      label: 'PENDING'
    },
    accepted: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      label: 'ACCEPTED'
    },
    declined: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      label: 'DECLINED'
    },
    countered: {
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      label: 'COUNTER OFFER'
    }
  };

  const getPropertyImage = (property: Property | null): string => {
    if (property?.images && property.images.length > 0) {
      return property.images[0];
    }
    return '';
  };

  const getSmartScore = (property: Property | null): number => {
    if (property?.sentimentScore) return Math.round(property.sentimentScore * 100);
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <Header onSignOut={handleSignOut} />
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
                My Apartments
              </h1>
              <p className="text-gray-600">
                Track your favorite properties and negotiation progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'saved' && selectedProperties.length > 0 && (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Compare Selected ({selectedProperties.length})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {activeTab === 'saved' && (
                <Button variant="outline" size="sm" onClick={() => refetchSaved()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Saved Properties ({savedApartments.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'offers'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Offers Made ({offers.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saved Properties Tab */}
        {activeTab === 'saved' && (
          <div>
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleExport} disabled={savedWithDetails.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loadingSaved && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading saved properties...</span>
              </div>
            )}

            {/* Error State */}
            {savedError && (
              <Card className="p-8 text-center bg-white shadow-2xl">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Failed to load saved properties
                </h3>
                <p className="text-gray-500 mb-4">
                  {savedError instanceof Error ? savedError.message : 'Please try again'}
                </p>
                <Button onClick={() => refetchSaved()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </Card>
            )}

            {/* Empty State */}
            {!loadingSaved && !savedError && savedWithDetails.length === 0 && (
              <Card className="p-12 text-center bg-white shadow-2xl">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No saved properties yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Browse apartments and save the ones you like to compare them here
                </p>
                <Button onClick={() => navigate('/dashboard')}>Browse Properties</Button>
              </Card>
            )}

            {/* Property Grid */}
            {!loadingSaved && savedWithDetails.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {savedWithDetails.map(({ saved, property }) => {
                  const image = getPropertyImage(property);
                  const smartScore = getSmartScore(property);
                  const rent = property?.minPrice || 0;
                  const name = property?.name || 'Unknown Property';
                  const address = property?.address || 'Address unavailable';

                  return (
                    <Card
                      key={saved.id}
                      className={`overflow-hidden cursor-pointer bg-white shadow-lg hover:shadow-xl transition-shadow ${
                        selectedProperties.includes(saved.apartmentId) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSelectProperty(saved.apartmentId)}
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-16 h-16 text-blue-300" />
                          </div>
                        )}
                        {smartScore > 0 && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-blue-600 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              {smartScore}
                            </Badge>
                          </div>
                        )}
                        {selectedProperties.includes(saved.apartmentId) && (
                          <div className="absolute top-3 left-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {name}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{address}</span>
                          {property?.city && (
                            <span className="ml-1 text-gray-400">
                              {property.city}, {property.state}
                            </span>
                          )}
                        </div>

                        {rent > 0 && (
                          <div className="mb-3">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                              ${rent.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">/ month</span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          {property?.bedroomsMin != null && (
                            <div className="flex items-center gap-1">
                              <Home className="w-3.5 h-3.5" />
                              {property.bedroomsMin}bd / {property.bathroomsMin || 1}ba
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(saved.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {saved.notes && (
                          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-sm text-gray-600 mb-3">
                            {saved.notes}
                          </div>
                        )}

                        {saved.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < (saved.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleViewDetails(saved.apartmentId, e)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleMakeOffer(saved.apartmentId, e)}
                          >
                            Make Offer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRemoveSaved(saved.apartmentId, e)}
                            disabled={removeMutation.isPending}
                          >
                            {removeMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {offers.length === 0 ? (
              <Card className="p-12 text-center bg-white shadow-2xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No offers made yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Save properties and generate negotiation offers to track them here
                </p>
                <Button onClick={() => navigate('/dashboard')}>Browse Properties</Button>
              </Card>
            ) : (
              offers.map((offer) => {
                const status = statusConfig[offer.status];
                const savings = offer.askingRent - offer.offerAmount;

                return (
                  <Card key={offer.id} className={`border-l-4 ${status.borderColor} bg-white shadow-lg`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {offer.propertyName}
                            </h3>
                            <Badge
                              className={`${status.bgColor} ${status.color} border ${status.borderColor}`}
                            >
                              {status.icon}
                              <span className="ml-2">{status.label}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {offer.address}, {offer.city}, {offer.state}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOffer(offer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>

                      {/* Offer Details */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="text-gray-600 text-sm mb-1">Asking Rent</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${offer.askingRent.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-blue-600 text-sm mb-1">Your Offer</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${offer.offerAmount.toLocaleString()}
                          </div>
                        </div>
                        {offer.counterOffer && (
                          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-purple-600 text-sm mb-1">Counter Offer</div>
                            <div className="text-2xl font-bold text-purple-600">
                              ${offer.counterOffer.toLocaleString()}
                            </div>
                          </div>
                        )}
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <div className="text-green-600 text-sm mb-1">Potential Savings</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${savings.toLocaleString()}/mo
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            ${(savings * 12).toLocaleString()}/year
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Sent: {new Date(offer.sentDate).toLocaleDateString()}</span>
                        </div>
                        {offer.responseDate && (
                          <>
                            <span className="text-gray-400">→</span>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Responded: {new Date(offer.responseDate).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Landlord Response */}
                      {offer.landlordResponse && (
                        <div className={`p-4 rounded-lg mb-4 ${status.bgColor} border ${status.borderColor}`}>
                          <div className="flex items-start gap-3">
                            <MessageSquare className={`w-5 h-5 ${status.color} flex-shrink-0 mt-0.5`} />
                            <div>
                              <div className={`font-semibold ${status.color} mb-1`}>
                                Landlord Response:
                              </div>
                              <div className="text-gray-700">
                                {offer.landlordResponse}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Step */}
                      {offer.nextStep && (
                        <div className="flex items-center gap-2 text-gray-700 mb-4">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">Next Step:</span>
                          <span>{offer.nextStep}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {offer.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOffer(offer.id)}
                          >
                            Withdraw Offer
                          </Button>
                        )}
                        {offer.status === 'accepted' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/verify-lease')}>
                            <FileText className="w-4 h-4 mr-2" />
                            Submit Lease for Verification
                          </Button>
                        )}
                        {offer.status === 'countered' && offer.propertyId && (
                          <Button size="sm" onClick={() => navigate(`/generate-offer?propertyId=${offer.propertyId}`)}>
                            Make New Offer
                          </Button>
                        )}
                        {offer.status === 'declined' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveOffer(offer.id)}>
                            Archive
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
