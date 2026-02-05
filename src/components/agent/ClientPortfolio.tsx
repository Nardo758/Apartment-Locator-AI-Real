import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authFetchJson } from '@/lib/authHelpers';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Eye,
  MessageSquare,
  MoreVertical
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'closed' | 'lost';
  budget: number;
  location: string;
  bedrooms: string;
  moveInDate: string;
  addedDate: string;
  lastContact: string;
  notes: string;
  viewedProperties: number;
  offers: number;
  estimatedCommission: number;
}

interface ApiAgentClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status?: string | null;
  stage?: string | null;
  budget?: { min?: number; max?: number } | null;
  preferredLocations?: string[] | null;
  bedrooms?: number | null;
  moveInDate?: string | null;
  createdAt?: string | null;
  lastContact?: string | null;
  notes?: string | null;
  priority?: string | null;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    status: 'active',
    budget: 2800,
    location: 'Manhattan, NY',
    bedrooms: '2',
    moveInDate: '2024-03-15',
    addedDate: '2024-02-01',
    lastContact: '2024-02-02',
    notes: 'Looking for pet-friendly apartments near Central Park',
    viewedProperties: 12,
    offers: 2,
    estimatedCommission: 420
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    status: 'pending',
    budget: 3500,
    location: 'Brooklyn, NY',
    bedrooms: '3',
    moveInDate: '2024-04-01',
    addedDate: '2024-01-28',
    lastContact: '2024-01-30',
    notes: 'Family of 4, needs parking and good schools nearby',
    viewedProperties: 8,
    offers: 1,
    estimatedCommission: 525
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    status: 'active',
    budget: 2200,
    location: 'Queens, NY',
    bedrooms: '1',
    moveInDate: '2024-03-01',
    addedDate: '2024-02-03',
    lastContact: '2024-02-03',
    notes: 'First-time renter, flexible on location',
    viewedProperties: 15,
    offers: 3,
    estimatedCommission: 330
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    phone: '(555) 456-7890',
    status: 'closed',
    budget: 4200,
    location: 'Manhattan, NY',
    bedrooms: '3',
    moveInDate: '2024-02-15',
    addedDate: '2024-01-15',
    lastContact: '2024-01-28',
    notes: 'Lease signed! Upper West Side luxury apartment',
    viewedProperties: 6,
    offers: 1,
    estimatedCommission: 630
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'landerson@email.com',
    phone: '(555) 567-8901',
    status: 'active',
    budget: 3000,
    location: 'Jersey City, NJ',
    bedrooms: '2',
    moveInDate: '2024-03-20',
    addedDate: '2024-01-25',
    lastContact: '2024-02-01',
    notes: 'Waterfront preferred, commutes to Manhattan',
    viewedProperties: 10,
    offers: 2,
    estimatedCommission: 450
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'dkim@email.com',
    phone: '(555) 678-9012',
    status: 'pending',
    budget: 1800,
    location: 'Bronx, NY',
    bedrooms: 'studio',
    moveInDate: '2024-02-28',
    addedDate: '2024-02-04',
    lastContact: '2024-02-04',
    notes: 'Budget-conscious, prefers newer buildings',
    viewedProperties: 5,
    offers: 0,
    estimatedCommission: 270
  },
  {
    id: '7',
    name: 'Amanda Foster',
    email: 'afoster@email.com',
    phone: '(555) 789-0123',
    status: 'lost',
    budget: 2500,
    location: 'Manhattan, NY',
    bedrooms: '1',
    moveInDate: '2024-02-01',
    addedDate: '2024-01-10',
    lastContact: '2024-01-25',
    notes: 'Decided to buy instead of rent',
    viewedProperties: 4,
    offers: 0,
    estimatedCommission: 0
  },
  {
    id: '8',
    name: 'Robert Taylor',
    email: 'rtaylor@email.com',
    phone: '(555) 890-1234',
    status: 'active',
    budget: 3800,
    location: 'Manhattan, NY',
    bedrooms: '2',
    moveInDate: '2024-04-15',
    addedDate: '2024-01-20',
    lastContact: '2024-02-02',
    notes: 'Corporate relocation, furnished preferred',
    viewedProperties: 7,
    offers: 1,
    estimatedCommission: 570
  }
];

export function ClientPortfolio() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mapStatus = (client: ApiAgentClient): Client['status'] => {
    if (client.status === 'archived') return 'lost';
    if (client.stage === 'closed') return 'closed';
    if (client.status === 'inactive') return 'pending';
    if (client.status === 'active') return 'active';
    if (client.stage === 'lead') return 'pending';
    return 'active';
  };

  const mapClient = (client: ApiAgentClient): Client => {
    const name = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || 'Unnamed Client';
    const budget = client.budget?.max ?? client.budget?.min ?? 0;
    const preferredLocation = client.preferredLocations?.[0] || '—';
    const bedrooms = client.bedrooms === 0 ? 'Studio' : client.bedrooms ? String(client.bedrooms) : '—';

    return {
      id: client.id,
      name,
      email: client.email,
      phone: client.phone || '—',
      status: mapStatus(client),
      budget,
      location: preferredLocation,
      bedrooms,
      moveInDate: client.moveInDate || '',
      addedDate: client.createdAt || '',
      lastContact: client.lastContact || '',
      notes: client.notes || 'No notes yet.',
      viewedProperties: 0,
      offers: 0,
      estimatedCommission: 0,
    };
  };

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      setLoadError(null);

      const result = await authFetchJson<{ clients: ApiAgentClient[] }>('/api/agent/clients');
      if (!result.success) {
        setLoadError(result.error);
        setClients([]);
        setIsLoading(false);
        return;
      }

      setClients(result.data.clients.map(mapClient));
      setIsLoading(false);
    };

    loadClients();
  }, []);

  const filteredClients = selectedStatus === 'all' 
    ? clients 
    : clients.filter(c => c.status === selectedStatus);

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    pending: clients.filter(c => c.status === 'pending').length,
    closed: clients.filter(c => c.status === 'closed').length,
    totalCommission: clients
      .filter(c => c.status === 'active' || c.status === 'pending')
      .reduce((sum, c) => sum + c.estimatedCommission, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'closed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'lost': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'closed': return <CheckCircle className="w-3 h-3" />;
      case 'lost': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card variant="elevated" className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Closed</p>
                <p className="text-2xl font-bold text-blue-400">{stats.closed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Potential</p>
                <p className="text-2xl font-bold text-pink-400">{formatCurrency(stats.totalCommission)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loadError && (
        <Card variant="elevated" className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-red-200">
            Failed to load clients: {loadError}
          </CardContent>
        </Card>
      )}

      {isLoading && !loadError && (
        <Card variant="elevated" className="border-white/10 bg-white/5">
          <CardContent className="p-4 text-white/70">
            Loading clients...
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'pending', 'closed', 'lost'].map((status) => (
              <Button
                key={status}
                onClick={() => setSelectedStatus(status)}
                variant={selectedStatus === status ? 'default' : 'outline'}
                className={`capitalize ${
                  selectedStatus === status
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All Clients' : status}
                {status !== 'all' && (
                  <Badge className="ml-2 bg-white/20">
                    {clients.filter(c => c.status === status).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            variant="elevated" 
            hover
            className="cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                    <Badge className={getStatusColor(client.status)}>
                      {getStatusIcon(client.status)}
                      <span className="ml-1 capitalize">{client.status}</span>
                    </Badge>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white/80 p-2">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span>{client.location} • {client.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <DollarSign className="w-4 h-4 text-white/40" />
                  <span>Budget: {formatCurrency(client.budget)}/mo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span>Move-in: {formatDate(client.moveInDate)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">Viewed</p>
                  <p className="text-lg font-semibold text-white">{client.viewedProperties}</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-xs text-white/50 mb-1">Offers</p>
                  <p className="text-lg font-semibold text-white">{client.offers}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">Est. Comm.</p>
                  <p className="text-lg font-semibold text-green-400">{formatCurrency(client.estimatedCommission)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/5" size="sm">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal (Simplified) */}
      {selectedClient && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClient(null)}
        >
          <Card 
            variant="elevated" 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedClient(null)}
                  className="border-white/20"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Email</p>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedClient.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Phone</p>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedClient.phone}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-white/50 mb-2">Notes</p>
                <p className="text-white/80 bg-white/5 p-3 rounded-lg">{selectedClient.notes}</p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
