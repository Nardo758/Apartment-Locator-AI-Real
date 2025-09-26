import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Settings, DollarSign, Shield, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import Header from '@/components/Header';
import { dataTracker } from '@/lib/data-tracker';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    email: '',
    location: 'Austin, TX',
    bio: '',
    // Financial verification fields
    gross_income: '',
    employment_type: '',
    employer_name: '',
    employment_duration: '',
    job_title: '',
    current_rent: '',
    credit_score: '',
    bank_verified: false,
    income_verified: false,
    plaid_account_id: '',
    plaid_access_token: ''
  });

  const [user, setUser] = useState<{ id?: string; email?: string } | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          email: (user && user.email) || '',
          location: data.location || 'Austin, TX',
          bio: data.bio || '',
          gross_income: data.budget?.toString() || '',
          employment_type: data.lifestyle || '',
          employer_name: '',
          employment_duration: '',
          job_title: '',
          current_rent: data.budget?.toString() || '',
          credit_score: '',
          bank_verified: data.has_completed_ai_programming || false,
          income_verified: data.has_completed_ai_programming || false,
          plaid_account_id: '',
          plaid_access_token: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser({ id: session.user.id, email: session.user.email });
      await loadProfile(session.user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/auth');
    }
  }, [navigate, loadProfile]);

  useEffect(() => {
    checkAuth();

    // Track profile page visit
    dataTracker.trackPageView();
    dataTracker.trackContent({
      contentType: 'profile',
      action: 'view',
      contentData: { page: 'profile_settings' }
    });
  }, [checkAuth]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      loadProfile(session.user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/auth');
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          email: user?.email || '',
          location: data.location || 'Austin, TX',
          bio: data.bio || '',
          gross_income: data.budget?.toString() || '',
          employment_type: data.lifestyle || '',
          employer_name: '',
          employment_duration: '',
          job_title: '',
          current_rent: data.budget?.toString() || '',
          credit_score: '',
          bank_verified: data.has_completed_ai_programming || false,
          income_verified: data.has_completed_ai_programming || false,
          plaid_account_id: '',
          plaid_access_token: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    const oldProfile = { ...profile };
    setLoading(true);
    
    // Track profile update attempt
    dataTracker.trackContent({
      contentType: 'profile',
      action: 'update',
      contentData: {
        fields_changed: Object.keys(profile).filter(key => 
          profile[key as keyof typeof profile] !== oldProfile[key as keyof typeof oldProfile]
        ),
        has_financial_info: !!(profile.gross_income || profile.current_rent),
        employment_type: profile.employment_type,
        timestamp: new Date().toISOString()
      }
    });
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          location: profile.location,
          bio: profile.bio,
          budget: parseFloat(profile.gross_income) || null,
          lifestyle: profile.employment_type,
          has_completed_ai_programming: profile.income_verified,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidSuccess = (token: string, metadata: unknown) => {
    const meta = (metadata as Record<string, unknown> | undefined) || {};
    setProfile({
      ...profile,
      plaid_access_token: token,
      plaid_account_id: (meta.account_id as string) || '',
      bank_verified: true,
      income_verified: true
    });
    
    // Track bank connection
    dataTracker.trackContent({
      contentType: 'financial_verification',
      action: 'create',
        contentData: {
        verification_type: 'bank_connection',
        provider: 'plaid',
        account_type: (meta.account_type as string) || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
    
    toast({
      title: "Bank Account Connected",
      description: "Your financial information has been verified successfully.",
    });
  };

  const employmentTypes = [
    'Full-time W2', 'Part-time W2', 'Contract/1099', 'Self-employed', 
    'Student', 'Retired', 'Unemployed', 'Other'
  ];

  const employmentDurations = [
    'Less than 6 months', '6-12 months', '1-2 years', 
    '2-5 years', '5+ years'
  ];

  const creditScoreRanges = [
    'Excellent (750+)', 'Good (700-749)', 'Fair (650-699)', 
    'Poor (600-649)', 'Bad (Below 600)', 'No Credit History'
  ];

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />
      
      <ModernPageLayout
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
        showHeader={false}
        headerContent={
          <Button 
            onClick={handleSave}
            disabled={loading}
            className={`${designSystem.buttons.primary} gap-2`}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      >
        <div className={designSystem.spacing.content}>
          {/* Profile Summary */}
          <ModernCard 
            className={`${designSystem.animations.entrance} mb-8`}
            gradient
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                  {profile.email || 'Your Profile'}
                </h2>
                <p className={designSystem.typography.body}>
                  {profile.location || 'Location not set'}
                </p>
              </div>
              <div className="flex gap-2">
                {profile.income_verified && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.bank_verified && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Bank Connected
                  </Badge>
                )}
              </div>
            </div>
          </ModernCard>

          {/* Basic Information */}
          <ModernCard 
            title="Basic Information"
            icon={<User className="w-6 h-6 text-blue-600" />}
            animate
            className="mb-8"
          >
            <div className={designSystem.spacing.content}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="Austin, TX"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>
            </div>
          </ModernCard>

          {/* Employment Information */}
          <ModernCard 
            title="Employment Information"
            icon={<Settings className="w-6 h-6 text-purple-600" />}
            animate
            animationDelay={100}
            className="mb-8"
          >
            <div className={designSystem.spacing.content}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={profile.employment_type} onValueChange={(value) => setProfile({ ...profile, employment_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employer_name">Employer Name</Label>
                  <Input
                    id="employer_name"
                    value={profile.employer_name}
                    onChange={(e) => setProfile({ ...profile, employer_name: e.target.value })}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={profile.job_title}
                    onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="employment_duration">Employment Duration</Label>
                  <Select value={profile.employment_duration} onValueChange={(value) => setProfile({ ...profile, employment_duration: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentDurations.map((duration) => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Financial Information */}
          <ModernCard 
            title="Financial Information"
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            animate
            animationDelay={200}
          >
            <div className={designSystem.spacing.content}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="gross_income">Annual Gross Income</Label>
                  <Input
                    id="gross_income"
                    type="number"
                    value={profile.gross_income}
                    onChange={(e) => setProfile({ ...profile, gross_income: e.target.value })}
                    placeholder="75000"
                  />
                </div>
                <div>
                  <Label htmlFor="current_rent">Current Monthly Rent</Label>
                  <Input
                    id="current_rent"
                    type="number"
                    value={profile.current_rent}
                    onChange={(e) => setProfile({ ...profile, current_rent: e.target.value })}
                    placeholder="1800"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="credit_score">Credit Score Range</Label>
                  <Select value={profile.credit_score} onValueChange={(value) => setProfile({ ...profile, credit_score: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select credit score range" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditScoreRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Bank Verification Status */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <Label className="text-base font-medium">Bank Account Verification</Label>
                    </div>
                    <p className={`text-sm ${designSystem.colors.muted}`}>
                      Connect your bank account for instant income verification and better rental offers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.bank_verified ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          // This would trigger Plaid Link in a real implementation
                          handlePlaidSuccess('demo_token', { account_id: 'demo_account' });
                        }}
                      >
                        <Shield className="w-4 h-4" />
                        Connect Bank
                      </Button>
                    )}
                  </div>
                </div>
                
                {profile.income_verified && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-400 mb-1">
                          Income Verified Successfully
                        </div>
                        <div className={`text-sm ${designSystem.colors.muted}`}>
                          Your income has been automatically verified through your bank account. This gives you a competitive advantage in rental applications.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModernCard>
        </div>
      </ModernPageLayout>
    </div>
  );
};

export default Profile;