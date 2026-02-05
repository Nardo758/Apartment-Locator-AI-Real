import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';
import AlertConfigDialog from './AlertConfigDialog';
import {
  User,
  Bell,
  AlertCircle,
  Plug,
  Mail,
  Key,
  Shield,
  Building,
  Phone,
  MapPin,
  Loader2,
  Settings,
} from 'lucide-react';

const LandlordSettings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Notification state
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    weekly_digest: true,
    monthly_report: true,
    marketing_emails: false,
  });

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsSave = async () => {
    try {
      setIsSaving(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated.',
      });
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update notification preferences.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, notifications, and integrations
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex gap-2 items-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2 items-center">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <div className="flex gap-2 items-center">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) =>
                          setProfileData({ ...profileData, company: e.target.value })
                        }
                        placeholder="ABC Properties LLC"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) =>
                          setProfileData({ ...profileData, city: e.target.value })
                        }
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) =>
                          setProfileData({ ...profileData, state: e.target.value })
                        }
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={profileData.zip}
                        onChange={(e) =>
                          setProfileData({ ...profileData, zip: e.target.value })
                        }
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </h3>
                <Button variant="outline" className="w-full md:w-auto">
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        email_notifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest" className="font-medium">
                      Weekly Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get a weekly summary of your portfolio performance
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notificationSettings.weekly_digest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        weekly_digest: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="monthly-report" className="font-medium">
                      Monthly Report
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive detailed monthly reports and insights
                    </p>
                  </div>
                  <Switch
                    id="monthly-report"
                    checked={notificationSettings.monthly_report}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        monthly_report: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails" className="font-medium">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and offers
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notificationSettings.marketing_emails}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        marketing_emails: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationsSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alert Configuration
              </CardTitle>
              <CardDescription>
                Configure real-time alerts for your properties and market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 border rounded-lg bg-accent/20">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-8 w-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Real-Time Alerts</h3>
                      <p className="text-muted-foreground mb-4">
                        Stay informed about critical changes in your portfolio and the market.
                        Configure alerts for price changes, concessions, vacancy risks, and
                        market trends.
                      </p>
                      <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Get notified when competitor prices change
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Track new concessions and incentives in your market
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Receive vacancy risk warnings before lease end dates
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Stay updated on market trends and opportunities
                        </li>
                      </ul>
                      <Button onClick={() => setAlertDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Alert Preferences
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Alert History</h3>
                  <p className="text-sm text-muted-foreground">
                    View your recent alerts in the dashboard or navigate to the Portfolio
                    Dashboard to see all alerts for your properties.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/landlord-dashboard'}>
                    View Landlord Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>
                Connect external services and tools to enhance your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for future integrations */}
                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <Plug className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">Integrations Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We're working on integrations with popular property management
                    software, accounting tools, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="px-3 py-1 bg-accent rounded-full text-sm">
                      Property Management
                    </div>
                    <div className="px-3 py-1 bg-accent rounded-full text-sm">
                      Accounting
                    </div>
                    <div className="px-3 py-1 bg-accent rounded-full text-sm">
                      CRM
                    </div>
                    <div className="px-3 py-1 bg-accent rounded-full text-sm">
                      Analytics
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Config Dialog */}
      <AlertConfigDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen} />
    </div>
  );
};

export default LandlordSettings;
