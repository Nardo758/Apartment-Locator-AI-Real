import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, X, Settings, TrendingUp, Activity, Home, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import LocationIntelligence from '@/components/LocationIntelligence';
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
  priorities?: string[];
  deal_breakers?: string[];
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
        
        if (!session?.user) {
          navigate('/auth');
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

  // Check if user has AI preferences setup
  const hasAIPreferences = userProfile?.has_completed_ai_programming || 
    (userProfile?.amenities && userProfile.amenities.length > 0) ||
    (userProfile?.priorities && userProfile.priorities.length > 0) ||
    userProfile?.budget;

  const getAIPreferencesCount = () => {
    let count = 0;
    if (userProfile?.budget) count++;
    if (userProfile?.amenities?.length > 0) count++;
    if (userProfile?.priorities?.length > 0) count++;
    if (userProfile?.deal_breakers?.length > 0) count++;
    return count;
  };

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
          {/* Header Section */}
          <div className="mb-8">
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    Welcome back, <span className="gradient-text">{userState.name}</span>! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    Found {mockProperties.length} properties in {userProfile?.location || 'atlanta, TX'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* AI Status Indicator */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className={`w-2 h-2 rounded-full ${hasAIPreferences ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                    <Badge 
                      variant={hasAIPreferences ? "default" : "outline"}
                      className={hasAIPreferences ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                    >
                      {hasAIPreferences ? `AI Preferences Active (${getAIPreferencesCount()})` : 'Setup AI Preferences'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">3</div>
                    <div className="text-sm text-muted-foreground">new matches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content - Location Intelligence Hero */}
            <div className="xl:col-span-3 space-y-6">
              <LocationIntelligence userProfile={userProfile} />
              
              {/* Selected Apartment Details - Shows when apartment is clicked */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">AI TOP PICK</Badge>
                  Selected Property
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-1">Mosaic Lake Apartments</h4>
                    <p className="text-muted-foreground mb-3">123 Lakefront Dr, Atlanta, TX 75551</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">${mockProperties[0]?.effectivePrice || 2450}/mo</div>
                        <div className="text-sm text-muted-foreground">Base Rent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">94%</div>
                        <div className="text-sm text-muted-foreground">AI Match Score</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">18 min</div>
                        <div className="text-sm text-muted-foreground">Avg Commute</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-400">92%</div>
                        <div className="text-sm text-muted-foreground">Preference Match</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">To Work</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">12 min</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">To Gym</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">22 min</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-slate-800/30 rounded-lg p-4 h-40 flex items-center justify-center mb-4">
                      <span className="text-muted-foreground">Property Images</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Schedule Tour</Button>
                      <Button size="sm" variant="outline" className="flex-1">Save Property</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Smart Insights */}
              <Card className="glass-dark border-l-4 border-l-green-400">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Price Alert</div>
                      <div className="text-xs text-muted-foreground">3 properties dropped price</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Market Trend</div>
                      <div className="text-xs text-muted-foreground">Prices trending up 2.3%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">New Matches</div>
                      <div className="text-xs text-muted-foreground">5 new properties found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Market Intel */}
              <Card className="glass-dark border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                    Live Market Intel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Median Rent</span>
                      <span className="text-sm font-semibold text-foreground">$2,340</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +5.2% vs last month
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Days on Market</span>
                      <span className="text-sm font-semibold text-foreground">18 days</span>
                    </div>
                    <div className="text-xs text-red-400 flex items-center">
                      <Activity className="w-3 h-3 mr-1" />
                      -2 days vs last month
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                      <span className="text-sm font-semibold text-foreground">94.2%</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      +1.8% vs last month
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">New Listings</span>
                      <span className="text-sm font-semibold text-foreground">23</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center">
                      <Home className="w-3 h-3 mr-1" />
                      +8 vs last week
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                    <span className="text-sm font-medium">{userProfile?.location || 'Atlanta, TX'}</span>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardNew;