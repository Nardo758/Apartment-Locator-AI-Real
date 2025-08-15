import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar, MapPin, TrendingUp, Clock, Home, AlertCircle, X, Bell, Settings, ChevronRight, DollarSign, Zap, Heart, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyState } from '@/contexts/PropertyStateContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import LocationSearch from '@/components/LocationSearch';
import QuickActions from '@/components/QuickActions';
import MarketIntelligence from '@/components/MarketIntelligence';
import PopularCities from '@/components/PopularCities';
import QuickLinksCard from '@/components/QuickLinksCard';
import { mockProperties } from '@/data/mockData';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  location?: string;
  search_radius?: number;
  max_drive_time?: number;
  points_of_interest?: any;
  budget?: number;
  bedrooms?: string;
  amenities?: string[];
  has_completed_ai_programming?: boolean;
  program_ai_prompt_dismissed?: boolean;
}

interface UserState {
  name: string;
  leaseExpiration: string;
  budget: number;
  savedProperties: number;
  scheduledTours: number;
  applications: number;
}

const DashboardNew = () => {
  const navigate = useNavigate();
  const { searchFilters, setSearchFilters } = usePropertyState();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('AI Recommended');
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    city: 'Austin',
    state: 'TX', 
    radius: 25,
    maxDriveTime: 30,
    pointsOfInterest: []
  });
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProgramAIPrompt, setShowProgramAIPrompt] = useState(false);

  // Mock user state for display
  const userState: UserState = {
    name: user?.email?.split('@')[0] || 'User',
    leaseExpiration: 'April 2025',
    budget: userProfile?.budget || 2500,
    savedProperties: 12,
    scheduledTours: 3,
    applications: 1
  };

  // Check authentication and load user profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Allow viewing without authentication for demo purposes
        if (!session?.user) {
          // Set demo user state for non-authenticated users
          setUser({ email: 'demo@example.com' });
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Load user profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error loading profile:', error);
          toast.error('Failed to load profile');
          return;
        }

        if (profile) {
          setUserProfile(profile as any);
          
          // Sync with location state if profile has location data
          if (profile.location) {
            const [city, state] = profile.location.split(', ');
            setCurrentLocation({
              city: city || 'Austin',
              state: state || 'TX',
              radius: profile.search_radius || 25,
              maxDriveTime: profile.max_drive_time || 30,
              pointsOfInterest: (profile.points_of_interest as any) || []
            });
          }

          // Show "Program Your AI" prompt if not completed and not dismissed
          if (!profile.has_completed_ai_programming && !profile.program_ai_prompt_dismissed) {
            setShowProgramAIPrompt(true);
          }
        } else {
          // Create initial profile for new users
          const { error: createError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: session.user.id,
              email: session.user.email,
              has_completed_social_signup: true,
              location: 'Austin, TX',
              search_radius: 25,
              max_drive_time: 30,
              budget: 2500
            });

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            setShowProgramAIPrompt(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLocationSelect = async (location: typeof currentLocation) => {
    setCurrentLocation(location);
    
    // Update profile in database
    if (user && userProfile) {
      try {
        const updateData = {
          location: `${location.city}, ${location.state}`,
          search_radius: location.radius,
          max_drive_time: location.maxDriveTime,
          points_of_interest: location.pointsOfInterest as any
        };
        
        const { error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error updating profile:', error);
        } else {
          toast.success('Search settings updated!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleProgramAIClick = () => {
    navigate('/program-ai');
  };

  const dismissProgramAIPrompt = async () => {
    setShowProgramAIPrompt(false);
    
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ program_ai_prompt_dismissed: true })
        .eq('user_id', user.id);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const quickActions = [
    { id: 'schedule', label: 'Schedule Tours', icon: Calendar, count: 3 },
    { id: 'saved', label: 'Saved Properties', icon: Heart, count: userState.savedProperties },
    { id: 'applications', label: 'Applications', icon: TrendingUp, count: 1 },
    { id: 'alerts', label: 'Price Alerts', icon: Bell, count: 2 }
  ];

  const filters = [
    { id: 'recommended', label: '🎯 AI Recommended', count: 12 },
    { id: 'new', label: '✨ New Matches', count: 3 },
    { id: 'deals', label: '💰 Best Deals', count: 8 },
    { id: 'tours', label: '🏠 Tour Ready', count: 15 }
  ];

  const priorityInsights = [
    {
      type: 'opportunity',
      title: 'New properties in your price range',
      description: '3 properties matching your criteria posted today',
      action: 'View Properties',
      urgency: 'high',
      icon: TrendingUp
    },
    {
      type: 'alert',
      title: 'Lease expiration reminder',
      description: `Your lease expires ${userState.leaseExpiration}`,
      action: 'Update Timeline',
      urgency: 'medium',
      icon: Calendar
    },
    {
      type: 'savings',
      title: 'Potential concession opportunity',
      description: 'Properties offering first month free near you',
      action: 'Explore Deals',
      urgency: 'low',
      icon: DollarSign
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Get synced settings for Quick Actions
  const syncedSettings = userProfile ? {
    location: userProfile.location || 'Austin, TX',
    radius: userProfile.search_radius || 25,
    maxDriveTime: userProfile.max_drive_time || 30,
    pointsOfInterest: (userProfile.points_of_interest as any) || []
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Header onSignOut={handleSignOut} />
      
      {/* Program AI Prompt - Non-dismissible initially */}
      {showProgramAIPrompt && (
        <div className="border-b border-border/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Alert className="border-blue-500/30 bg-blue-500/5">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <div className="flex items-center justify-between w-full">
                <div>
                  <AlertDescription className="text-foreground">
                    <strong>Program Your AI</strong> for better results! Customize your search preferences and get personalized recommendations.
                  </AlertDescription>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    size="sm" 
                    onClick={handleProgramAIClick}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Program AI
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={dismissProgramAIPrompt}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      )}
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section - Simplified */}
          <div className="mb-8">
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    Welcome back, <span className="gradient-text">{userState.name}</span>! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    Found {mockProperties.length} properties in {userProfile?.location || 'Austin, TX'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">3</div>
                  <div className="text-sm text-muted-foreground">new matches</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Priority Insights */}
              {priorityInsights.length > 0 && (
                <div className="space-y-3">
                  {priorityInsights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <div key={index} className={`glass-dark rounded-lg p-4 border-l-4 ${
                        insight.urgency === 'high' ? 'border-l-red-400' : 
                        insight.urgency === 'medium' ? 'border-l-yellow-400' : 'border-l-green-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              insight.urgency === 'high' ? 'bg-red-400/20' : 
                              insight.urgency === 'medium' ? 'bg-yellow-400/20' : 'bg-green-400/20'
                            }`}>
                              <Icon size={16} className={
                                insight.urgency === 'high' ? 'text-red-400' : 
                                insight.urgency === 'medium' ? 'text-yellow-400' : 'text-green-400'
                              } />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            {insight.action}
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search Area Modal/Overlay */}
              {showSearchArea && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <LocationSearch 
                      onLocationChange={handleLocationSelect}
                      currentLocation={currentLocation}
                    />
                    <div className="mt-4 text-center">
                      <Button 
                        onClick={() => setShowSearchArea(false)}
                        variant="outline"
                        className="bg-slate-800/50"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? "default" : "outline"}
                      onClick={() => setActiveFilter(filter.id)}
                      className="relative"
                    >
                      {filter.label}
                      {filter.count > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {filter.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Properties Grid */}
                <div className="space-y-4">
                  {mockProperties.slice(0, 6).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button variant="outline">
                    Load More Properties
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActions 
                onSearchAreaClick={() => setShowSearchArea(true)}
                syncedSettings={syncedSettings}
                onSettingsChange={handleLocationSelect}
              />

              {/* Market Intelligence */}
              <MarketIntelligence />

              {/* Popular Cities */}
              <PopularCities 
                onLocationSelect={(city, state) => {
                  setCurrentLocation(prev => ({ ...prev, city, state }));
                }}
                currentLocation={`${currentLocation.city}, ${currentLocation.state}`}
              />

              {/* Search Preferences */}
              <Card className="glass-dark border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings size={20} className="mr-2 text-muted-foreground" />
                    Search Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Range</span>
                    <span className="text-sm font-medium">${userState.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Location</span>
                    <span className="text-sm font-medium">{userProfile?.location || 'Austin, TX'}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={handleProgramAIClick}
                  >
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <QuickLinksCard variant="sidebar" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardNew;