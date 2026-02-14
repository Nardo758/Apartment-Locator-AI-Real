import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Settings, DollarSign, Shield, CheckCircle, AlertCircle, CreditCard, MapPin, Info } from 'lucide-react';
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
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const unifiedAI = useUnifiedAI();
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
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const typedData = data as any;
        setProfile({
          email: (user && user.email) || '',
          location: typedData.location || 'Austin, TX',
          bio: typedData.bio || '',
          gross_income: typedData.budget?.toString() || '',
          employment_type: typedData.lifestyle || '',
          employer_name: '',
          employment_duration: '',
          job_title: '',
          current_rent: typedData.budget?.toString() || '',
          credit_score: '',
          bank_verified: typedData.has_completed_ai_programming || false,
          income_verified: typedData.has_completed_ai_programming || false,
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

  // The `checkAuth` and `loadProfile` functions are declared above using useCallback.
  // Keep those implementations (for stable references) and avoid redeclaring them here.

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
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const { error } = await (supabase as any)
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

      // Refresh UnifiedAI context with new data from Supabase
      await unifiedAI.refreshFromDatabase();

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
      <ModernPageLayout
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
        showHeader={true}
        headerContent={
          <Button 
            onClick={handleSave}
            disabled={loading}
            className={`${designSystem.buttons.primary} gap-2 ${designSystem.animations.hoverLift}`}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      >
        <div className={designSystem.spacing.content}>
          {/* Profile Summary */}
          <ModernCard 
            className={`${designSystem.animations.entrance} ${designSystem.spacing.marginLarge} ${designSystem.backgrounds.cardPrimary} ${designSystem.backgrounds.cardHoverPrimary}`}
            gradient
          >
            <div className="flex items-center gap-6 p-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                {(profile.income_verified || profile.bank_verified) && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className={`${designSystem.typography.heading3} mb-2 ${designSystem.colors.text}`}>
                  {profile.email || 'Your Profile'}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <p className={`${designSystem.typography.body} ${designSystem.colors.textMuted}`}>
                    {profile.location || 'Location not set'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.income_verified && (
                    <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Income Verified
                    </Badge>
                  )}
                  {profile.bank_verified && (
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                      <Shield className="w-3 h-3 mr-1" />
                      Bank Connected
                    </Badge>
                  )}
                  {!profile.income_verified && !profile.bank_verified && (
                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Verification Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Basic Information */}
          <ModernCard 
            title="Basic Information"
            icon={<User className="w-6 h-6 text-blue-600" />}
            animate
            className={`${designSystem.spacing.marginLarge} ${designSystem.backgrounds.card} ${designSystem.backgrounds.cardHover}`}
          >
            <div className={`${designSystem.spacing.contentLarge} space-y-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className={designSystem.typography.labelLarge}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className={designSystem.typography.labelLarge}>
                    Preferred Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="Austin, TX"
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className={designSystem.typography.labelLarge}>
                  About You
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself and what you're looking for in your next home..."
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
                <p className="text-sm text-slate-500 mt-1">
                  This helps us provide more personalized recommendations
                </p>
              </div>
            </div>
          </ModernCard>

          {/* Employment Information */}
          <ModernCard 
            title="Employment Information"
            subtitle="Your employment details help verify income and improve rental applications"
            icon={<Settings className="w-6 h-6 text-purple-600" />}
            animate
            animationDelay={100}
            className={`${designSystem.spacing.marginLarge} ${designSystem.backgrounds.card} ${designSystem.backgrounds.cardHover}`}
          >
            <div className={`${designSystem.spacing.contentLarge} space-y-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employment_type" className={designSystem.typography.labelLarge}>
                    Employment Type
                  </Label>
                  <Select value={profile.employment_type} onValueChange={(value) => setProfile({ ...profile, employment_type: value })}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment_duration" className={designSystem.typography.labelLarge}>
                    Employment Duration
                  </Label>
                  <Select value={profile.employment_duration} onValueChange={(value) => setProfile({ ...profile, employment_duration: value })}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentDurations.map((duration) => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employer_name" className={designSystem.typography.labelLarge}>
                    Employer Name
                  </Label>
                  <Input
                    id="employer_name"
                    value={profile.employer_name}
                    onChange={(e) => setProfile({ ...profile, employer_name: e.target.value })}
                    placeholder="Company Name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title" className={designSystem.typography.labelLarge}>
                    Job Title
                  </Label>
                  <Input
                    id="job_title"
                    value={profile.job_title}
                    onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                    placeholder="Software Engineer"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Financial Information */}
          <ModernCard 
            title="Financial Information"
            subtitle="Secure financial details to strengthen your rental applications"
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            animate
            animationDelay={200}
            className={`${designSystem.backgrounds.card} ${designSystem.backgrounds.cardHover}`}
          >
            <div className={`${designSystem.spacing.contentLarge} space-y-8`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gross_income" className={designSystem.typography.labelLarge}>
                    Annual Gross Income
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="gross_income"
                      type="number"
                      value={profile.gross_income}
                      onChange={(e) => setProfile({ ...profile, gross_income: e.target.value })}
                      placeholder="75000"
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500">Before taxes and deductions</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_rent" className={designSystem.typography.labelLarge}>
                    Current Monthly Rent
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="current_rent"
                      type="number"
                      value={profile.current_rent}
                      onChange={(e) => setProfile({ ...profile, current_rent: e.target.value })}
                      placeholder="1800"
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500">Or expected rent budget</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="credit_score" className={designSystem.typography.labelLarge}>
                    Credit Score Range
                  </Label>
                  <Select value={profile.credit_score} onValueChange={(value) => setProfile({ ...profile, credit_score: value })}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                      <SelectValue placeholder="Select credit score range" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditScoreRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">Higher credit scores improve rental approval chances</p>
                </div>
              </div>
              
              {/* Bank Verification Status */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${profile.bank_verified ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <Label className={`${designSystem.typography.heading6} text-slate-900`}>
                          Bank Account Verification
                        </Label>
                        <p className={`text-sm ${designSystem.colors.textMuted} mt-1`}>
                          Connect your bank account for instant income verification and better rental offers
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {profile.bank_verified ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        className={`gap-2 ${designSystem.animations.hoverLift} border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300`}
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
                  <div className={`p-6 ${designSystem.backgrounds.cardSuccess} rounded-xl border border-green-200 shadow-sm`}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-green-100 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-green-800 mb-2 text-lg">
                          Income Verified Successfully ✨
                        </div>
                        <div className={`text-sm ${designSystem.colors.textMuted} leading-relaxed`}>
                          Your income has been automatically verified through your bank account. This gives you a competitive advantage in rental applications and may qualify you for exclusive properties.
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            <span>Faster approvals</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            <span>Better negotiating power</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            <span>Premium listings access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!profile.income_verified && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                          Complete your verification for better results
                        </div>
                        <div className={`text-sm ${designSystem.colors.muted}`}>
                          Verified profiles receive 3x more responses and access to exclusive properties
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