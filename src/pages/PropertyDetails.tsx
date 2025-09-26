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
  AlertTriangle,
  Camera,
  Target,
  HelpCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockProperties, type Property } from '@/data/mockData';
import { usePropertyState } from '@/contexts';
import { ApartmentIQAI, SampleDataFactory } from '@/lib/apartmentiq-ai';
import { AlgorithmAnalyticsTracker } from '@/lib/analytics-architecture-audit';
import { toast } from '@/hooks/use-toast';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
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
  type AiAnalysis = {
    opportunityScore?: number;
    tier?: string;
    successRate?: number; // 0..1
    recommendation?: string;
  } | null;

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis>(null);
  const [loading, setLoading] = useState<boolean>(!selectedProperty);
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
      
      // AI analysis should run in a separate effect depending on `property` below
    };

    if (id) {
      loadPropertyDetails();
    }
  }, [id, navigate, selectedProperty, setSelectedProperty]);

  // Run AI analysis when we have a property (separate effect to satisfy exhaustive-deps)
  useEffect(() => {
    const runAiAnalysis = async () => {
      if (!property) return;

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

        // Narrow result to the expected shape before setting state
        let normalized: AiAnalysis = null;
        if (result && typeof result === 'object') {
          const obj = result as unknown as Record<string, unknown>;
          normalized = {
            opportunityScore: typeof obj.opportunityScore === 'number' ? (obj.opportunityScore as number) : undefined,
            tier: typeof obj.tier === 'string' ? (obj.tier as string) : undefined,
            successRate: typeof obj.successRate === 'number' ? (obj.successRate as number) : undefined,
            recommendation: typeof obj.recommendation === 'string' ? (obj.recommendation as string) : undefined,
          };
        }

        setAiAnalysis(normalized);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('AI analysis failed:', message);
      }
    };

    void runAiAnalysis();
  }, [property]);

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
      <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
        <Header />
        <div className={`${designSystem.layouts.container} ${designSystem.layouts.header} flex items-center justify-center min-h-[400px]`}>
          <ModernCard className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>
                Loading Property Details...
              </h3>
              <p className={designSystem.typography.body}>
                Analyzing property data and market conditions
              </p>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
        <Header />
        <div className={`${designSystem.layouts.container} ${designSystem.layouts.header} flex items-center justify-center min-h-[400px]`}>
          <ModernCard className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className={`${designSystem.typography.subheadingLarge} mb-4`}>
                Property Not Found
              </h1>
              <Button onClick={() => navigate('/dashboard')} className={designSystem.buttons.primary}>
                Back to Dashboard
              </Button>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  // AI Pricing computed values
  const aiPredicted = property.aiPrice;
  const potentialSavings = property.originalPrice - aiPredicted;
  const monthlyConcession = (() => {
    const monthly = property.concessions?.find(c => /\/mo/i.test(c.value));
    if (monthly) {
      const match = monthly.value.match(/\$?([\d,]+)/);
      if (match) return Number(match[1].replace(/,/g, ''));
    }
    return 0;
  })();
  const totalMonthlySavings = potentialSavings + monthlyConcession;
  const annualSavings = totalMonthlySavings * 12;

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
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />
      
      <main className={`${designSystem.layouts.container} ${designSystem.layouts.header}`}>
        <Breadcrumb />
        
        {/* Navigation & Actions */}
        <div className={`${designSystem.animations.entrance} flex items-center justify-between mb-8`}>
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
              className={isFavorited ? "text-red-500 border-red-500 bg-red-50 dark:bg-red-900/20" : ""}
            >
              <Heart size={16} className={isFavorited ? "fill-current" : ""} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 size={16} />
            </Button>
            <Button 
              onClick={handleGenerateOffer}
              className={`${designSystem.buttons.primary} gap-2`}
            >
              <Zap size={16} />
              Generate AI Offer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <ModernCard 
              className={`${designSystem.animations.entrance}`}
              gradient
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className={`${designSystem.typography.hero} mb-3`}>{property.name}</h1>
                  <div className="flex items-center text-muted-foreground mb-6">
                    <MapPin size={18} className="mr-2" />
                    <span className={designSystem.typography.bodyLarge}>
                      {property.address}, {property.city}, {property.state} {property.zip}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <Bed size={18} className="text-blue-600" />
                      <span className="font-medium">{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <Bath size={18} className="text-green-600" />
                      <span className="font-medium">{property.bathrooms} bath</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <Maximize size={18} className="text-purple-600" />
                      <span className="font-medium">{property.sqft} sq ft</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                      <Building size={18} className="text-orange-600" />
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(property.availabilityType)}`}></div>
                    <span className="text-sm font-medium">{property.availability}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4">
                    {property.matchScore}% Match
                  </Badge>
                </div>
              </div>

              {/* Pricing Analysis */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`${designSystem.typography.subheadingLarge} text-green-800 dark:text-green-400`}>
                      AI Pricing Analysis
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-500">
                      Based on market data and negotiation opportunities
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Original Price</div>
                    <div className="text-lg font-semibold text-muted-foreground line-through">
                      ${property.originalPrice.toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">AI Predicted</div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${aiPredicted.toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Your Savings</div>
                    <div className="text-lg font-semibold text-green-600">
                      ${potentialSavings.toLocaleString()}/mo
                    </div>
                  </div>
                </div>

                {/* Concession Value Line Item */}
                <div className="flex items-center justify-center mb-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Concession Value: </span>
                    <span className="font-semibold text-green-600">${monthlyConcession.toLocaleString()}/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalMonthlySavings.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Annual Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${annualSavings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Image Gallery */}
            <ModernCard 
              title="Property Photos"
              icon={<Camera className="w-6 h-6 text-blue-600" />}
              animate
              animationDelay={100}
              className="mb-6"
            >
              <div className="space-y-4">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <Building size={48} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Property Photos</p>
                    <p className="text-sm text-muted-foreground">Click to view full gallery</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200 border border-gray-200 dark:border-gray-600"
                    />
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Detailed Information Tabs */}
            <ModernCard 
              animate
              animationDelay={200}
              className="mb-6"
            >
              <Tabs defaultValue="features" className="w-full">
                <TabsList className={`grid w-full grid-cols-4 ${designSystem.backgrounds.card}`}>
                  <TabsTrigger value="features" className="gap-2">
                    <Shield size={16} />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="gap-2">
                    <Dumbbell size={16} />
                    Amenities
                  </TabsTrigger>
                  <TabsTrigger value="commute" className="gap-2">
                    <MapPin size={16} />
                    Commute
                  </TabsTrigger>
                  <TabsTrigger value="policies" className="gap-2">
                    <Users size={16} />
                    Policies
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="space-y-4 mt-6">
                  <h4 className={`${designSystem.typography.subheadingLarge} mb-4`}>Property Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <Shield size={16} className="text-blue-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="amenities" className="space-y-4 mt-6">
                  <h4 className={`${designSystem.typography.subheadingLarge} mb-4`}>Building Amenities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Users;
                      return (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <IconComponent size={16} className="text-green-600" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="commute" className="space-y-4 mt-6">
                  <h4 className={`${designSystem.typography.subheadingLarge} mb-4`}>Commute Times</h4>
                  <div className="space-y-3">
                    {property.commutes.map((commute, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-purple-600" />
                          <span className="font-medium">{commute.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock size={14} className="text-purple-600" />
                          {commute.time} by {commute.method}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="policies" className="space-y-4 mt-6">
                  <h4 className={`${designSystem.typography.subheadingLarge} mb-4`}>Property Policies</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                      <div className="font-medium mb-2 flex items-center gap-2">
                        <Users size={16} className="text-orange-600" />
                        Pet Policy
                      </div>
                      <div className="text-sm text-muted-foreground">{property.petPolicy}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <div className="font-medium mb-2 flex items-center gap-2">
                        <Car size={16} className="text-blue-600" />
                        Parking
                      </div>
                      <div className="text-sm text-muted-foreground">{property.parking}</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Loss Indicator */}
            <ModernCard 
              title="Landlord Loss Indicator"
              subtitle="If unit stays vacant"
              icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
              animate
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <div className="text-lg font-bold text-amber-600">$1,320</div>
                  <div className="text-xs text-muted-foreground mt-1">30 Days</div>
                </div>
                <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">$2,640</div>
                  <div className="text-xs text-muted-foreground mt-1">60 Days</div>
                </div>
                <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="text-lg font-bold text-red-600">$3,960</div>
                  <div className="text-xs text-muted-foreground mt-1">90 Days</div>
                </div>
              </div>
            </ModernCard>
              
            {/* AI Analysis */}
            {aiAnalysis && (
              <ModernCard 
                title="AI Opportunity Analysis"
                icon={<Target className="w-6 h-6 text-blue-600" />}
                animate
                animationDelay={100}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              >
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round(aiAnalysis.opportunityScore)}%
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">Opportunity Score</div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {aiAnalysis.tier}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">{Math.round(aiAnalysis.successRate * 100)}%</span>
                  </div>
                  <Progress value={aiAnalysis.successRate * 100} className="h-3" />
                </div>
                
                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">AI Recommendation</div>
                  <div className="text-xs text-blue-700 dark:text-blue-500">{aiAnalysis.recommendation}</div>
                </div>
              </ModernCard>
            )}

            {/* Concessions */}
            <ModernCard 
              title="Predicted Concessions"
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              animate
              animationDelay={200}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div className="space-y-3">
                {property.concessions.map((concession, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{concession.type}</div>
                      <div className="text-xs text-muted-foreground">{concession.value}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        concession.color === 'green' ? 'text-green-600' :
                        concession.color === 'yellow' ? 'text-yellow-600' : 'text-orange-600'
                      }`}>
                        {concession.probability}%
                      </div>
                      <div className="text-xs text-muted-foreground">probability</div>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Contact Information */}
            <ModernCard 
              title="Contact Property"
              icon={<Phone className="w-6 h-6 text-blue-600" />}
              animate
              animationDelay={300}
            >
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone size={16} />
                  Call (555) 123-4567
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail size={16} />
                  Email Property
                </Button>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium mb-1">Property Manager: Sarah Johnson</div>
                  <div className="text-xs text-muted-foreground">
                    Response time: Usually within 2 hours
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Quick Actions */}
            <ModernCard 
              animate
              animationDelay={400}
            >
              <div className="space-y-3">
                <Button 
                  className={`w-full ${designSystem.buttons.primary} gap-2`}
                  onClick={handleGenerateOffer}
                >
                  <Zap size={16} />
                  Generate AI Offer
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar size={16} />
                  Schedule Tour
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link to="/saved-properties">
                    <Star size={16} />
                    View Saved Properties
                  </Link>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link to="/help">
                    <HelpCircle size={16} />
                    Need Help?
                  </Link>
                </Button>
              </div>
            </ModernCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;