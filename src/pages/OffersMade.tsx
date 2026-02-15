import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, Calendar, DollarSign, MapPin, ArrowLeft, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';

interface RentalOffer {
  id: string;
  property_id: string;
  property_details: Record<string, unknown>;
  monthly_budget: number;
  lease_term: number;
  move_in_date: string;
  ai_suggestions: Record<string, unknown>;
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
      console.warn('Feature not yet connected - using API routes');
      setOffers([]);
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
      <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
        <Header />
        <div className={`${designSystem.layouts.container} ${designSystem.layouts.header} flex items-center justify-center h-64`}>
          <ModernCard className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <p className={designSystem.typography.body}>Loading your offers...</p>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <ModernPageLayout
        title="Offers Made"
        subtitle="Track the status of your rental applications and AI-generated offers"
        showHeader={true}
        headerContent={
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/generate-offer">
              <Button className={`${designSystem.buttons.primary} ${designSystem.buttons.small} gap-2`}>
                <Plus size={16} />
                New Offer
              </Button>
            </Link>
          </div>
        }
      >

        {/* Stats Overview */}
        <div className={`${designSystem.layouts.gridFour} mb-8`}>
          {[
            {
              icon: FileText,
              title: "Total Offers",
              value: offers.length,
              color: "text-blue-600"
            },
            {
              icon: Clock,
              title: "Pending",
              value: offers.filter(o => o.status === 'pending').length,
              color: "text-yellow-600"
            },
            {
              icon: CheckCircle,
              title: "Accepted",
              value: offers.filter(o => o.status === 'accepted').length,
              color: "text-green-600"
            },
            {
              icon: DollarSign,
              title: "Total Budget",
              value: `$${offers.reduce((total, offer) => total + (offer.monthly_budget || 0), 0).toLocaleString()}`,
              color: "text-purple-600"
            }
          ].map((stat, index) => (
            <ModernCard
              key={stat.title}
              animate
              animationDelay={index * 100}
              hover
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className={`${designSystem.typography.label} font-medium`}>
                    {stat.title}
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Offers List */}
        <div className={designSystem.spacing.content}>
          {offers.length === 0 ? (
            <ModernCard className="text-center p-12">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>No Offers Made Yet</h3>
                  <p className={`${designSystem.typography.body} mb-6`}>
                    Start browsing properties and use our AI to generate compelling rental offers that get results.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/dashboard')} className={`${designSystem.buttons.primary} gap-2`}>
                    <Target className="w-4 h-4" />
                    Browse Properties
                  </Button>
                  <Link to="/generate-offer">
                    <Button variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Offer
                    </Button>
                  </Link>
                </div>
              </div>
            </ModernCard>
          ) : (
            offers.map((offer, index) => {
              const ai = (offer.ai_suggestions && typeof offer.ai_suggestions === 'object') ? (offer.ai_suggestions as Record<string, unknown>) : {};
              const negotiatedPriceText = ai.negotiated_price ? String(ai.negotiated_price) : 'N/A';
              const successProbabilityText = ai.success_probability ? String(ai.success_probability) : 'N/A';
              return (
              <ModernCard
                key={offer.id}
                animate
                animationDelay={index * 100 + 400}
                hover
                className="mb-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`${designSystem.typography.subheadingLarge}`}>
                        {(((offer.property_details && typeof offer.property_details === 'object') ? (offer.property_details as Record<string, unknown>).address : undefined) as string) || `Property ${offer.property_id}`}
                      </h3>
                      <Badge className={`${getStatusColor(offer.status || 'pending')} flex items-center gap-1`}>
                        {getStatusIcon(offer.status || 'pending')}
                        {(offer.status || 'pending').charAt(0).toUpperCase() + (offer.status || 'pending').slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{String(((offer.property_details && typeof offer.property_details === 'object') ? (offer.property_details as Record<string, unknown>).city : undefined) || 'Austin, TX')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">${offer.monthly_budget?.toLocaleString()}/month</span>
                      </div>
                    </div>

                    {/* AI Suggestions Preview */}
                    {offer.ai_suggestions && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-3">AI Negotiation Strategy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className={designSystem.colors.muted}>Offer Amount:</span>
                            <span className="text-green-600 font-medium">
                              ${negotiatedPriceText}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={designSystem.colors.muted}>Success Rate:</span>
                            <span className="text-yellow-600 font-medium">
                              {successProbabilityText}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={designSystem.colors.muted}>Lease Term:</span>
                            <span className="text-purple-600 font-medium">
                              {offer.lease_term} months
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {offer.notes && (
                      <div className="text-sm text-muted-foreground italic p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        "{offer.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(offer)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Property
                    </Button>
                  </div>
                </div>
              </ModernCard>
            );
            })
          )}
        </div>
      </ModernPageLayout>
    </div>
  );
};

export default OffersMade;