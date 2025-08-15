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
    budget: 2500,
    bedrooms: '1',
    lease_duration: '12 months',
    move_timeline: 'Within 3 months',
    lifestyle: '',
    credit_score: '',
    work_address: '',
    transportation: '',
    amenities: [] as string[],
    deal_breakers: [] as string[],
    bio: '',
    communication: [] as string[]
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Allow demo access
        setUser({ email: 'demo@example.com' });
        return;
      }
      
      setUser(session.user);
      loadProfile(session.user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
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
          budget: data.budget || 2500,
          bedrooms: data.bedrooms || '1',
          lease_duration: data.lease_duration || '12 months',
          move_timeline: data.move_timeline || 'Within 3 months',
          lifestyle: data.lifestyle || '',
          credit_score: data.credit_score || '',
          work_address: data.work_address || '',
          transportation: data.transportation || '',
          amenities: data.amenities || [],
          deal_breakers: data.deal_breakers || [],
          bio: data.bio || '',
          communication: data.communication || []
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
          budget: profile.budget,
          bedrooms: profile.bedrooms,
          lease_duration: profile.lease_duration,
          move_timeline: profile.move_timeline,
          lifestyle: profile.lifestyle,
          credit_score: profile.credit_score,
          work_address: profile.work_address,
          transportation: profile.transportation,
          amenities: profile.amenities,
          deal_breakers: profile.deal_breakers,
          bio: profile.bio,
          communication: profile.communication,
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

  const amenityOptions = [
    'In-unit laundry', 'Gym/Fitness center', 'Pool', 'Parking', 'Pet-friendly',
    'Balcony/Patio', 'Dishwasher', 'Air conditioning', 'Elevator', 'Storage'
  ];

  const communicationOptions = [
    'Email', 'Text/SMS', 'Phone calls', 'App notifications'
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

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

          {/* Housing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Housing Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={profile.bedrooms} onValueChange={(value) => setProfile({ ...profile, bedrooms: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1">1 bedroom</SelectItem>
                      <SelectItem value="2">2 bedrooms</SelectItem>
                      <SelectItem value="3">3+ bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Monthly Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={profile.budget}
                    onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) || 0 })}
                    placeholder="2500"
                  />
                </div>
                <div>
                  <Label htmlFor="lease_duration">Lease Duration</Label>
                  <Select value={profile.lease_duration} onValueChange={(value) => setProfile({ ...profile, lease_duration: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="12 months">12 months</SelectItem>
                      <SelectItem value="18 months">18 months</SelectItem>
                      <SelectItem value="24 months">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="move_timeline">Move Timeline</Label>
                  <Select value={profile.move_timeline} onValueChange={(value) => setProfile({ ...profile, move_timeline: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASAP">ASAP</SelectItem>
                      <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                      <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                      <SelectItem value="Within 6 months">Within 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities & Deal Breakers */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Desired Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {amenityOptions.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={profile.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem(profile.amenities, amenity, (arr) => setProfile({ ...profile, amenities: arr }))}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Communication Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {communicationOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={profile.communication.includes(option) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem(profile.communication, option, (arr) => setProfile({ ...profile, communication: arr }))}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;