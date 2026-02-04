import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';

type Tab = 'saved' | 'offers';
type ViewMode = 'grid' | 'list';

interface SavedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  rent: number;
  trueCost: number;
  smartScore: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  savedDate: string;
  notes?: string;
}

interface Offer {
  id: string;
  propertyName: string;
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

// Mock data
const mockSavedProperties: SavedProperty[] = [
  {
    id: '1',
    name: 'ARIUM Downtown',
    address: '1234 Main St, Unit 205',
    city: 'Austin',
    state: 'TX',
    rent: 2200,
    trueCost: 2387,
    smartScore: 92,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://via.placeholder.com/400x300',
    savedDate: '2026-02-03',
    notes: 'Love the location, close to work'
  },
  {
    id: '2',
    name: 'The Domain',
    address: '5678 Oak Ave, Unit 8B',
    city: 'Austin',
    state: 'TX',
    rent: 2400,
    trueCost: 2450,
    smartScore: 88,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://via.placeholder.com/400x300',
    savedDate: '2026-02-02',
    notes: 'Great amenities'
  },
  {
    id: '3',
    name: 'Mueller District',
    address: '999 Congress Ave, Apt 12',
    city: 'Austin',
    state: 'TX',
    rent: 1900,
    trueCost: 2045,
    smartScore: 85,
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://via.placeholder.com/400x300',
    savedDate: '2026-02-01'
  }
];

const mockOffers: Offer[] = [
  {
    id: '1',
    propertyName: 'ARIUM Downtown',
    address: '1234 Main St, Unit 205',
    city: 'Austin',
    state: 'TX',
    askingRent: 2200,
    offerAmount: 2100,
    status: 'pending',
    sentDate: '2026-02-03',
    nextStep: 'Follow up in 3 days (Feb 6)'
  },
  {
    id: '2',
    propertyName: 'The Domain',
    address: '5678 Oak Ave, Unit 8B',
    city: 'Austin',
    state: 'TX',
    askingRent: 2400,
    offerAmount: 2300,
    status: 'accepted',
    sentDate: '2026-02-01',
    responseDate: '2026-02-02',
    landlordResponse: 'Accepted! Move-in March 1.',
    nextStep: 'Sign lease by Feb 15'
  },
  {
    id: '3',
    propertyName: 'Riverside Towers',
    address: '2468 River Rd, #305',
    city: 'Austin',
    state: 'TX',
    askingRent: 2000,
    offerAmount: 1900,
    status: 'declined',
    sentDate: '2026-01-30',
    responseDate: '2026-01-31',
    landlordResponse: 'Already rented to another tenant'
  },
  {
    id: '4',
    propertyName: 'Downtown Lofts',
    address: '7890 Market St, Unit 402',
    city: 'Austin',
    state: 'TX',
    askingRent: 2500,
    offerAmount: 2350,
    status: 'countered',
    sentDate: '2026-02-02',
    responseDate: '2026-02-03',
    counterOffer: 2425,
    landlordResponse: 'Can do $2,425/mo with 1 month free',
    nextStep: 'Respond to counter offer'
  }
];

export default function SavedAndOffers() {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [savedProperties] = useState(mockSavedProperties);
  const [offers] = useState(mockOffers);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const handleSelectProperty = (id: string) => {
    if (selectedProperties.includes(id)) {
      setSelectedProperties(selectedProperties.filter(p => p !== id));
    } else {
      setSelectedProperties([...selectedProperties, id]);
    }
  };

  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'PENDING'
    },
    accepted: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'ACCEPTED'
    },
    declined: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'DECLINED'
    },
    countered: {
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: 'COUNTER OFFER'
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Saved & Offers
              </h1>
              <p className="text-white/60">
                Track your favorite properties and negotiation progress
              </p>
            </div>
            {activeTab === 'saved' && selectedProperties.length > 0 && (
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Compare Selected ({selectedProperties.length})
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Saved Properties ({savedProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'offers'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Property Grid */}
            {savedProperties.length === 0 ? (
              <Card variant="glass" className="p-12 text-center">
                <Heart className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">
                  No saved properties yet
                </h3>
                <p className="text-white/50 mb-4">
                  Start saving properties you're interested in
                </p>
                <Button>Browse Properties</Button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {savedProperties.map((property) => (
                  <Card
                    key={property.id}
                    variant="elevated"
                    hover
                    className={`overflow-hidden cursor-pointer ${
                      selectedProperties.includes(property.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelectProperty(property.id)}
                  >
                    {/* Property Image */}
                    <div className="relative h-48">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="primary" size="sm">
                          <Star className="w-3 h-3 mr-1" />
                          {property.smartScore}
                        </Badge>
                      </div>
                      {selectedProperties.includes(property.id) && (
                        <div className="absolute top-3 left-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {property.name}
                      </h3>
                      <div className="flex items-center text-white/60 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.address}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ${property.rent}
                          </div>
                          <div className="text-xs text-white/50">per month</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">TRUE COST</div>
                          <div className="text-lg font-bold text-blue-400">
                            ${property.trueCost}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {property.bedrooms}bd / {property.bathrooms}ba
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Saved {property.savedDate}
                        </div>
                      </div>

                      {property.notes && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 mb-4">
                          {property.notes}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          Make Offer
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {offers.length === 0 ? (
              <Card variant="glass" className="p-12 text-center">
                <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">
                  No offers made yet
                </h3>
                <p className="text-white/50 mb-4">
                  Start negotiating on properties you're interested in
                </p>
                <Button>Browse Properties</Button>
              </Card>
            ) : (
              offers.map((offer) => {
                const status = statusConfig[offer.status];
                const savings = offer.askingRent - offer.offerAmount;

                return (
                  <Card key={offer.id} variant="elevated" className={`border-l-4 ${status.borderColor}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {offer.propertyName}
                            </h3>
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
                          </div>
                          <div className="flex items-center text-white/60 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {offer.address}, {offer.city}, {offer.state}
                          </div>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-white/60 text-sm mb-1">Asking Rent</div>
                          <div className="text-2xl font-bold text-white">
                            ${offer.askingRent}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="text-blue-300 text-sm mb-1">Your Offer</div>
                          <div className="text-2xl font-bold text-blue-400">
                            ${offer.offerAmount}
                          </div>
                        </div>
                        {offer.counterOffer && (
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="text-purple-300 text-sm mb-1">Counter Offer</div>
                            <div className="text-2xl font-bold text-purple-400">
                              ${offer.counterOffer}
                            </div>
                          </div>
                        )}
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="text-green-300 text-sm mb-1">Potential Savings</div>
                          <div className="text-2xl font-bold text-green-400">
                            ${savings}/mo
                          </div>
                          <div className="text-xs text-green-300 mt-1">
                            ${savings * 12}/year
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
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

                      {/* Landlord Response */}
                      {offer.landlordResponse && (
                        <div className={`p-4 rounded-lg mb-4 ${status.bgColor} border ${status.borderColor}`}>
                          <div className="flex items-start gap-3">
                            <MessageSquare className={`w-5 h-5 ${status.color} flex-shrink-0 mt-0.5`} />
                            <div>
                              <div className={`font-semibold ${status.color} mb-1`}>
                                Landlord Response:
                              </div>
                              <div className="text-white/80">
                                {offer.landlordResponse}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Step */}
                      {offer.nextStep && (
                        <div className="flex items-center gap-2 text-white/70 mb-4">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">Next Step:</span>
                          <span>{offer.nextStep}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {offer.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Landlord
                            </Button>
                            <Button variant="ghost" size="sm">
                              Withdraw Offer
                            </Button>
                          </>
                        )}
                        {offer.status === 'accepted' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <FileText className="w-4 h-4 mr-2" />
                              View Lease
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download Docs
                            </Button>
                          </>
                        )}
                        {offer.status === 'countered' && (
                          <>
                            <Button size="sm">
                              Accept Counter (${offer.counterOffer})
                            </Button>
                            <Button variant="outline" size="sm">
                              Make New Offer
                            </Button>
                          </>
                        )}
                        {offer.status === 'declined' && (
                          <Button variant="ghost" size="sm">
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
