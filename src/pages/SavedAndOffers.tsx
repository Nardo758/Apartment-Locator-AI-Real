import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/useUser';
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
  DollarSign,
  Home,
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';

type Tab = 'saved' | 'offers';
type ViewMode = 'grid' | 'list';

export default function SavedAndOffers() {
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const { data: savedApartments = [], isLoading: loadingSaved, error: savedError, refetch } = useQuery<any[]>({
    queryKey: ['/api/saved-apartments', user?.id],
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (apartmentId: string) => {
      await apiRequest('DELETE', `/api/saved-apartments/${user?.id}/${apartmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-apartments', user?.id] });
    },
  });

  const [offers] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('user_offers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSelectProperty = (id: string) => {
    if (selectedProperties.includes(id)) {
      setSelectedProperties(selectedProperties.filter(p => p !== id));
    } else {
      setSelectedProperties([...selectedProperties, id]);
    }
  };

  const handleExport = () => {
    if (savedApartments.length === 0) return;
    const headers = ['Name', 'Address', 'Rent', 'Saved Date'];
    const rows = savedApartments.map((apt: any) => [
      apt.propertyName || apt.name || 'N/A',
      apt.address || 'N/A',
      apt.rent || apt.monthlyRent || 'N/A',
      apt.createdAt || apt.savedDate || 'N/A'
    ]);
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-apartments.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <Header />
      <div className="bg-white border-b border-gray-200 shadow-sm pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
              My Apartments
            </h1>
            <p className="text-gray-600">
              Track your favorite properties and negotiation progress
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              data-testid="tab-saved"
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
              data-testid="tab-offers"
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
        {activeTab === 'saved' && (
          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <div className="flex items-center gap-3">
                <Button
                  data-testid="button-view-grid"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  data-testid="button-view-list"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {selectedProperties.length > 0 && (
                  <Button data-testid="button-compare-selected" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Compare Selected ({selectedProperties.length})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button data-testid="button-export" variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {loadingSaved ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600" data-testid="text-loading-saved">Loading saved properties...</p>
              </div>
            ) : savedError ? (
              <Card className="p-12 text-center bg-white shadow-2xl">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Failed to load saved properties
                </h3>
                <p className="text-gray-500 mb-4" data-testid="text-error-saved">
                  {(savedError as Error).message || 'An error occurred'}
                </p>
                <Button data-testid="button-try-again" onClick={() => refetch()}>Try Again</Button>
              </Card>
            ) : savedApartments.length === 0 ? (
              <Card className="p-12 text-center bg-white shadow-2xl">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No saved properties yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start saving properties you're interested in
                </p>
                <Button data-testid="button-browse-properties" onClick={() => navigate('/dashboard')}>Browse Properties</Button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {savedApartments.map((property: any) => {
                  const propertyId = property.id || property.propertyId;
                  const propertyName = property.propertyName || property.name || 'Property';
                  const propertyAddress = property.address || '';
                  const propertyRent = property.monthlyRent || property.rent || 0;
                  const propertyImage = property.imageUrl || property.image || '';

                  return (
                    <Card
                      key={propertyId}
                      hover
                      data-testid={`card-property-${propertyId}`}
                      className={`overflow-hidden cursor-pointer bg-white shadow-2xl ${
                        selectedProperties.includes(propertyId) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSelectProperty(propertyId)}
                    >
                      <div className="relative h-48">
                        {propertyImage ? (
                          <img
                            src={propertyImage}
                            alt={propertyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Home className="w-12 h-12 text-blue-300" />
                          </div>
                        )}
                        {property.smartScore && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="primary" size="sm">
                              <Star className="w-3 h-3 mr-1" />
                              {property.smartScore}
                            </Badge>
                          </div>
                        )}
                        {selectedProperties.includes(propertyId) && (
                          <div className="absolute top-3 left-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {propertyName}
                        </h3>
                        {propertyAddress && (
                          <div className="flex items-center text-gray-600 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {propertyAddress}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                              ${propertyRent}
                            </div>
                            <div className="text-xs text-gray-500">per month</div>
                          </div>
                          {property.trueCost && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">TRUE COST</div>
                              <div className="text-lg font-bold text-blue-600">
                                ${property.trueCost}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          {(property.bedrooms || property.bathrooms) && (
                            <div className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {property.bedrooms}bd / {property.bathrooms}ba
                            </div>
                          )}
                          {(property.createdAt || property.savedDate) && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Saved {property.createdAt || property.savedDate}
                            </div>
                          )}
                        </div>

                        {property.notes && (
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-gray-700 mb-4">
                            {property.notes}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            data-testid={`button-view-details-${propertyId}`}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/property/${propertyId}`); }}
                          >
                            View Details
                          </Button>
                          <Button
                            data-testid={`button-make-offer-${propertyId}`}
                            size="sm"
                            className="flex-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/generate-offer?propertyId=${propertyId}`); }}
                          >
                            Make Offer
                          </Button>
                          <Button
                            data-testid={`button-delete-${propertyId}`}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(propertyId); }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {activeTab === 'offers' && (
          <div className="space-y-6">
            {offers.length === 0 ? (
              <Card className="p-12 text-center bg-white shadow-2xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No offers made yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start negotiating on properties you're interested in
                </p>
                <Button data-testid="button-browse-offers" onClick={() => navigate('/dashboard')}>Browse Properties</Button>
              </Card>
            ) : (
              offers.map((offer: any) => {
                const status = statusConfig[offer.status as keyof typeof statusConfig];
                const savings = offer.askingRent - offer.offerAmount;

                return (
                  <Card key={offer.id} data-testid={`card-offer-${offer.id}`} className={`border-l-4 ${status?.borderColor || 'border-gray-300'} bg-white shadow-2xl`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {offer.propertyName}
                            </h3>
                            {status && (
                              <Badge
                                variant={
                                  offer.status === 'accepted' ? 'success' :
                                  offer.status === 'declined' ? 'error' :
                                  offer.status === 'countered' ? 'primary' : 'warning'
                                }
                              >
                                {status.icon}
                                <span className="ml-2">{status.label}</span>
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {offer.address}, {offer.city}, {offer.state}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="text-gray-600 text-sm mb-1">Asking Rent</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${offer.askingRent}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-blue-600 text-sm mb-1">Your Offer</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${offer.offerAmount}
                          </div>
                        </div>
                        {offer.counterOffer && (
                          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-purple-600 text-sm mb-1">Counter Offer</div>
                            <div className="text-2xl font-bold text-purple-600">
                              ${offer.counterOffer}
                            </div>
                          </div>
                        )}
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <div className="text-green-600 text-sm mb-1">Potential Savings</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${savings}/mo
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            ${savings * 12}/year
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Sent: {offer.sentDate}</span>
                        </div>
                        {offer.responseDate && (
                          <>
                            <span>→</span>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Responded: {offer.responseDate}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {offer.landlordResponse && status && (
                        <div className={`p-4 rounded-lg mb-4 ${status.bgColor.replace(/\/\d+/, '/20')} border ${status.borderColor}`}>
                          <div className="flex items-start gap-3">
                            <MessageSquare className={`w-5 h-5 ${status.color.replace('400', '600')} flex-shrink-0 mt-0.5`} />
                            <div>
                              <div className={`font-semibold ${status.color.replace('400', '600')} mb-1`}>
                                Landlord Response:
                              </div>
                              <div className="text-gray-700">
                                {offer.landlordResponse}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {offer.nextStep && (
                        <div className="flex items-center gap-2 text-gray-700 mb-4">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">Next Step:</span>
                          <span>{offer.nextStep}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {offer.status === 'pending' && (
                          <>
                            <Button data-testid={`button-message-${offer.id}`} variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Landlord
                            </Button>
                            <Button data-testid={`button-withdraw-${offer.id}`} variant="ghost" size="sm">
                              Withdraw Offer
                            </Button>
                          </>
                        )}
                        {offer.status === 'accepted' && (
                          <>
                            <Button data-testid={`button-view-lease-${offer.id}`} size="sm" className="bg-green-600 hover:bg-green-700">
                              <FileText className="w-4 h-4 mr-2" />
                              View Lease
                            </Button>
                            <Button data-testid={`button-download-docs-${offer.id}`} variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download Docs
                            </Button>
                          </>
                        )}
                        {offer.status === 'countered' && (
                          <>
                            <Button data-testid={`button-accept-counter-${offer.id}`} size="sm">
                              Accept Counter (${offer.counterOffer})
                            </Button>
                            <Button data-testid={`button-new-offer-${offer.id}`} variant="outline" size="sm">
                              Make New Offer
                            </Button>
                          </>
                        )}
                        {offer.status === 'declined' && (
                          <Button data-testid={`button-archive-${offer.id}`} variant="ghost" size="sm">
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
