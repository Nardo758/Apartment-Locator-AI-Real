import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RentalOffer {
  id: string;
  property_id: string;
  property_details: any;
  monthly_budget: number;
  lease_term: number;
  move_in_date: string;
  ai_suggestions: any;
  notes: string;
  created_at: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}

const OffersMade: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<RentalOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock status for demo purposes since we don't have a status column
      const offersWithStatus = data?.map((offer, index) => ({
        ...offer,
        status: (index === 0 ? 'pending' : index === 1 ? 'accepted' : 'pending') as 'pending' | 'accepted' | 'rejected' | 'expired'
      })) || [];

      setOffers(offersWithStatus);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load your offers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const handleViewDetails = (offer: RentalOffer) => {
    navigate(`/property/${offer.property_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <div className="pt-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="pt-20 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Offers Made</h1>
            <p className="text-muted-foreground">
              Track the status of your rental applications and AI-generated offers
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-dark border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{offers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Offers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {offers.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {offers.filter(o => o.status === 'accepted').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ${offers.reduce((total, offer) => total + (offer.monthly_budget || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Offers List */}
          <div className="space-y-6">
            {offers.length === 0 ? (
              <Card className="glass-dark border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Offers Made Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start browsing properties and use our AI to generate compelling rental offers.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} className="bg-gradient-primary">
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            ) : (
              offers.map((offer) => (
                <Card key={offer.id} className="glass-dark border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {offer.property_details?.address || `Property ${offer.property_id}`}
                          </h3>
                          <Badge className={getStatusColor(offer.status || 'pending')}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(offer.status || 'pending')}
                              {(offer.status || 'pending').charAt(0).toUpperCase() + (offer.status || 'pending').slice(1)}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {offer.property_details?.city || 'Austin, TX'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(offer.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${offer.monthly_budget?.toLocaleString()}/month
                          </div>
                        </div>

                        {/* AI Suggestions Preview */}
                        {offer.ai_suggestions && (
                          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-blue-400 mb-2">AI Negotiation Strategy</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Offer Amount:</span>
                                <span className="text-green-400 font-medium">
                                  ${offer.ai_suggestions.negotiated_price?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Success Rate:</span>
                                <span className="text-yellow-400 font-medium">
                                  {offer.ai_suggestions.success_probability || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Lease Term:</span>
                                <span className="text-purple-400 font-medium">
                                  {offer.lease_term} months
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {offer.notes && (
                          <div className="text-sm text-muted-foreground italic">
                            "{offer.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(offer)}
                          className="border-slate-600/50 hover:border-slate-500/50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Property
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersMade;