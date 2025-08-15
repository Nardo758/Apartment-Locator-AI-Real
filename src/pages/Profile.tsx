import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, MapPin, DollarSign, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

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
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          email: data.email || user?.email || '',
          location: data.location || 'Austin, TX',
          bio: data.bio || '',
          gross_income: data.gross_income?.toString() || '',
          employment_type: data.employment_type || '',
          employer_name: '',
          employment_duration: '',
          job_title: '',
          current_rent: data.current_rent?.toString() || '',
          credit_score: data.credit_score || '',
          bank_verified: data.income_verified || false,
          income_verified: data.income_verified || false,
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
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: profile.email,
          location: profile.location,
          bio: profile.bio,
          gross_income: parseFloat(profile.gross_income) || null,
          employment_type: profile.employment_type,
          current_rent: parseFloat(profile.current_rent) || null,
          credit_score: profile.credit_score,
          income_verified: profile.income_verified,
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

  const handlePlaidSuccess = (token: string, metadata: any) => {
    setProfile({
      ...profile,
      plaid_access_token: token,
      plaid_account_id: metadata.account_id,
      bank_verified: true,
      income_verified: true
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <User className="text-primary" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Profile Settings
                </h1>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
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
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Bank Account Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect your bank account for instant income verification
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.bank_verified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // This would trigger Plaid Link in a real implementation
                          handlePlaidSuccess('demo_token', { account_id: 'demo_account' });
                        }}
                      >
                        Connect Bank
                      </Button>
                    )}
                  </div>
                </div>
                
                {profile.income_verified && (
                  <div className="mt-3 p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Income Verified</Badge>
                      <span className="text-sm text-muted-foreground">
                        Your income has been automatically verified through your bank account
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;