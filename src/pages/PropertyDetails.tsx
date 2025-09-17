import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Car, 
  Wifi, 
  Dumbbell, 
  Waves,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  Bed,
  Bath,
  Maximize,
  Building,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockProperties, type Property } from '@/data/mockData';
import { usePropertyState } from '@/contexts/PropertyStateContext';
import { ApartmentIQAI, SampleDataFactory } from '@/lib/apartmentiq-ai';
import { AlgorithmAnalyticsTracker } from '@/lib/analytics-architecture-audit';
import { toast } from '@/hooks/use-toast';
import Breadcrumb from '@/components/Breadcrumb';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedProperty,
    setSelectedProperty,
    favoriteProperties,
    setFavoriteProperties 
  } = usePropertyState();
  
  const [property, setProperty] = useState<Property | null>(selectedProperty);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(!selectedProperty);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isFavorited = property ? favoriteProperties.includes(property.id) : false;

  useEffect(() => {
    const loadPropertyDetails = async () => {
      // If we have selectedProperty from context, use it
      if (selectedProperty && selectedProperty.id === id) {
        setProperty(selectedProperty);
        setLoading(false);
      } else {
        setLoading(true);
        
        // Find property in mock data
        const foundProperty = mockProperties.find(p => p.id === id);
        if (!foundProperty) {
          navigate('/dashboard');
          return;
        }
        
        setProperty(foundProperty);
        setSelectedProperty(foundProperty);
        setLoading(false);
      }
      
      // Perform AI analysis if we have a property
      if (property) {
        try {
          const aiEngine = new ApartmentIQAI();
          const tracker = new AlgorithmAnalyticsTracker();
          
          const propertyData = SampleDataFactory.createPropertyData();
          propertyData.propertyId = property.id;
          propertyData.rent = property.originalPrice;
          propertyData.vacancyDuration = property.daysVacant;
          
          const marketData = SampleDataFactory.createMarketData();
          const behavioralData = SampleDataFactory.createBehavioralData();
          const tenantProfile = SampleDataFactory.createTenantProfile();
          
          const { result } = await tracker.trackOpportunityAnalysis(
            propertyData,
            marketData,
            behavioralData,
            tenantProfile,
            'user-123',
            'session-456'
          );
          
          setAiAnalysis(result);
        } catch (error) {
          console.error('AI analysis failed:', error);
        }
      }
    };

    if (id) {
      loadPropertyDetails();
    }
  }, [id, navigate, selectedProperty, setSelectedProperty]);

  const handleFavorite = () => {
    if (!property) return;
    
    if (isFavorited) {
      setFavoriteProperties(favoriteProperties.filter(id => id !== property.id));
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites"
      });
    } else {
      setFavoriteProperties([...favoriteProperties, property.id]);
      toast({
        title: "Added to favorites",
        description: "Property saved to your favorites"
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Property link copied to clipboard"
    });
  };

  const handleGenerateOffer = () => {
    if (property) {
      setSelectedProperty(property);
      navigate('/generate-offer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading property details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getAvailabilityColor = (type: string) => {
    switch (type) {
      case 'immediate': return 'bg-green-500';
      case 'soon': return 'bg-yellow-500';
      case 'waitlist': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const amenityIcons: Record<string, React.ElementType> = {
    'Pool': Waves,
    'Gym': Dumbbell,
    'Business Center': Wifi,
    'Clubhouse': Users,
    'Rooftop Deck': Building,
    'Bike Storage': Car,
    'Coffee Bar': Users
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-6">
          <Breadcrumb />
          
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Search
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={isFavorited ? "text-red-500 border-red-500" : ""}
              >
                <Heart size={16} className={isFavorited ? "fill-current" : ""} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 size={16} />
              </Button>
              <Button 
                onClick={handleGenerateOffer}
                className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200"
              >
                <Zap size={16} className="mr-2" />
                Generate AI Offer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Header */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{property.name}</h1>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin size={16} className="mr-2" />
                      {property.address}, {property.city}, {property.state} {property.zip}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Bed size={16} className="text-muted-foreground" />
                        <span className="text-sm">{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath size={16} className="text-muted-foreground" />
                        <span className="text-sm">{property.bathrooms} bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize size={16} className="text-muted-foreground" />
                        <span className="text-sm">{property.sqft} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-muted-foreground" />
                        <span className="text-sm">Built {property.yearBuilt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(property.availabilityType)}`}></div>
                      <span className="text-sm text-muted-foreground">{property.availability}</span>
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {property.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="pricing-breakdown flex flex-col gap-4 p-4 bg-muted/30 rounded-lg">
                  {/* Line 1 - Original pricing comparison */}
                  <div className="pricing-line grid grid-cols-3 items-center gap-5">
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Original Price</div>
                      <div className="price-value original text-base font-semibold text-muted-foreground line-through">
                        ${property.originalPrice.toLocaleString()}/mo
                      </div>
                    </div>
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">AI Predicted Price</div>
                      <div className="price-value predicted text-base font-semibold text-purple-500">
                        ${property.effectivePrice.toLocaleString()}/mo
                      </div>
                    </div>
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Potential Savings</div>
                      <div className="price-value savings text-base font-semibold text-emerald-500">
                        ${property.savings.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  {/* Line 2 - Concessions breakdown */}
                  <div className="pricing-line grid grid-cols-3 items-center gap-5">
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Concessions Available</div>
                      <div className="price-value text-base font-semibold text-muted-foreground">
                        Yes
                      </div>
                    </div>
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Concession Value</div>
                      <div className="price-value predicted text-base font-semibold text-purple-500">
                        $200/mo
                      </div>
                    </div>
                    <div className="price-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Additional Savings</div>
                      <div className="price-value savings text-base font-semibold text-emerald-500">
                        $200/mo
                      </div>
                    </div>
                  </div>

                  {/* Line 3 - Total calculations */}
                  <div className="pricing-line total grid grid-cols-2 items-center gap-5 border-t border-border pt-4 mt-2">
                    <div className="total-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Total Monthly Savings</div>
                      <div className="price-value text-xl font-bold text-emerald-500">
                        $545/mo
                      </div>
                    </div>
                    <div className="total-item text-center">
                      <div className="price-label text-xs text-muted-foreground mb-1">Total Annual Savings</div>
                      <div className="price-value text-xl font-bold text-emerald-500">
                        $6,540/yr
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Photos</h3>
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg bg-muted/30 flex items-center justify-center">
                    <div className="text-center">
                      <Building size={48} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Property Photos</p>
                      <p className="text-sm text-muted-foreground">Click to view gallery</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((_, index) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Information Tabs */}
              <div className="glass rounded-xl p-6">
                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="commute">Commute</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="features" className="space-y-4 mt-6">
                    <h4 className="font-semibold">Property Features</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <Shield size={16} className="text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="space-y-4 mt-6">
                    <h4 className="font-semibold">Building Amenities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {property.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Users;
                        return (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                            <IconComponent size={16} className="text-primary" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="commute" className="space-y-4 mt-6">
                    <h4 className="font-semibold">Commute Times</h4>
                    <div className="space-y-3">
                      {property.commutes.map((commute, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            <span>{commute.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {commute.time} by {commute.method}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="policies" className="space-y-4 mt-6">
                    <h4 className="font-semibold">Property Policies</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium mb-1">Pet Policy</div>
                        <div className="text-sm text-muted-foreground">{property.petPolicy}</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium mb-1">Parking</div>
                        <div className="text-sm text-muted-foreground">{property.parking}</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Landlord Loss Indicator */}
              <Card className="glass bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertTriangle size={16} className="text-amber-400" />
                      </div>
                      Landlord Loss Indicator
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">If unit stays vacant</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="text-lg font-bold text-amber-400">$1,320</div>
                      <div className="text-xs text-muted-foreground mt-1">30 Days</div>
                    </div>
                    <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="text-lg font-bold text-orange-400">$2,640</div>
                      <div className="text-xs text-muted-foreground mt-1">60 Days</div>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-lg font-bold text-red-400">$3,960</div>
                      <div className="text-xs text-muted-foreground mt-1">90 Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Analysis */}
              {aiAnalysis && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap size={20} className="text-primary" />
                      AI Opportunity Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {Math.round(aiAnalysis.opportunityScore)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Opportunity Score</div>
                      <Badge variant="secondary" className="mt-2">
                        {aiAnalysis.tier}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">{Math.round(aiAnalysis.successRate * 100)}%</span>
                      </div>
                      <Progress value={aiAnalysis.successRate * 100} className="h-2" />
                    </div>
                    
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-sm font-medium text-primary mb-1">AI Recommendation</div>
                      <div className="text-xs text-muted-foreground">{aiAnalysis.recommendation}</div>
                    </div>
                  </CardContent>
                </Card>
                )}

              {/* Concessions */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" />
                    Predicted Concessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {property.concessions.map((concession, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{concession.type}</div>
                        <div className="text-xs text-muted-foreground">{concession.value}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          concession.color === 'green' ? 'text-green-500' :
                          concession.color === 'yellow' ? 'text-yellow-500' : 'text-orange-500'
                        }`}>
                          {concession.probability}%
                        </div>
                        <div className="text-xs text-muted-foreground">probability</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Contact Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone size={16} className="mr-2" />
                    Call (555) 123-4567
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail size={16} className="mr-2" />
                    Email Property
                  </Button>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Property Manager: Sarah Johnson
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Response time: Usually within 2 hours
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass">
                <CardContent className="pt-6 space-y-3">
                  <Button 
                    className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-200"
                    onClick={handleGenerateOffer}
                  >
                    <Zap size={16} className="mr-2" />
                    Generate AI Offer
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar size={16} className="mr-2" />
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/saved-properties">
                      <Star size={16} className="mr-2" />
                      View Saved Properties
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/help">
                      <Star size={16} className="mr-2" />
                      Need Help?
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;