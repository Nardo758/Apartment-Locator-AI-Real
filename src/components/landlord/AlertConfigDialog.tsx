import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell, Mail, Smartphone, AppWindow } from 'lucide-react';

interface AlertPreferences {
  price_changes: {
    enabled: boolean;
    threshold_percent: number;
  };
  concessions: {
    enabled: boolean;
  };
  vacancy_risk: {
    enabled: boolean;
    threshold_days: number;
  };
  market_trends: {
    enabled: boolean;
  };
  delivery: {
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
}

interface AlertConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertConfigDialog = ({ open, onOpenChange }: AlertConfigDialogProps) => {
  const [preferences, setPreferences] = useState<AlertPreferences>({
    price_changes: {
      enabled: true,
      threshold_percent: 5,
    },
    concessions: {
      enabled: true,
    },
    vacancy_risk: {
      enabled: true,
      threshold_days: 30,
    },
    market_trends: {
      enabled: true,
    },
    delivery: {
      email: true,
      sms: false,
      in_app: true,
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPreferences();
    }
  }, [open]);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/alert-preferences', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alert preferences');
      }

      const data = await response.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching alert preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load alert preferences.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/alert-preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save alert preferences');
      }

      toast({
        title: 'Success',
        description: 'Alert preferences updated successfully.',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving alert preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save alert preferences.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (path: string, value: any) => {
    const keys = path.split('.');
    setPreferences(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </DialogTitle>
          <DialogDescription>
            Configure which alerts you want to receive and how you want to be notified
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Alert Types */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Alert Types</h3>
              
              {/* Price Changes */}
              <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="price-changes" className="font-medium">
                      Price Changes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when competitor prices change significantly
                    </p>
                  </div>
                  <Switch
                    id="price-changes"
                    checked={preferences.price_changes.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('price_changes.enabled', checked)
                    }
                  />
                </div>
                {preferences.price_changes.enabled && (
                  <div className="pl-4 pt-2">
                    <Label htmlFor="price-threshold" className="text-sm">
                      Threshold: {preferences.price_changes.threshold_percent}% change
                    </Label>
                    <input
                      id="price-threshold"
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={preferences.price_changes.threshold_percent}
                      onChange={(e) => 
                        updatePreference('price_changes.threshold_percent', Number(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Concessions */}
              <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="concessions" className="font-medium">
                      New Concessions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when competitors offer new concessions or incentives
                    </p>
                  </div>
                  <Switch
                    id="concessions"
                    checked={preferences.concessions.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('concessions.enabled', checked)
                    }
                  />
                </div>
              </div>

              {/* Vacancy Risk */}
              <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vacancy-risk" className="font-medium">
                      Vacancy Risk
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when units are approaching lease end dates
                    </p>
                  </div>
                  <Switch
                    id="vacancy-risk"
                    checked={preferences.vacancy_risk.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('vacancy_risk.enabled', checked)
                    }
                  />
                </div>
                {preferences.vacancy_risk.enabled && (
                  <div className="pl-4 pt-2">
                    <Label htmlFor="vacancy-threshold" className="text-sm">
                      Alert {preferences.vacancy_risk.threshold_days} days before lease end
                    </Label>
                    <input
                      id="vacancy-threshold"
                      type="range"
                      min="7"
                      max="90"
                      step="7"
                      value={preferences.vacancy_risk.threshold_days}
                      onChange={(e) => 
                        updatePreference('vacancy_risk.threshold_days', Number(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Market Trends */}
              <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-trends" className="font-medium">
                      Market Trends
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get insights on broader market movements and opportunities
                    </p>
                  </div>
                  <Switch
                    id="market-trends"
                    checked={preferences.market_trends.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('market_trends.enabled', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery Methods */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Delivery Methods</h3>
              
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="delivery-email" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="delivery-email"
                    checked={preferences.delivery.email}
                    onCheckedChange={(checked) => 
                      updatePreference('delivery.email', checked)
                    }
                  />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="delivery-sms" className="font-medium">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for critical alerts (Pro feature)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="delivery-sms"
                    checked={preferences.delivery.sms}
                    onCheckedChange={(checked) => 
                      updatePreference('delivery.sms', checked)
                    }
                  />
                </div>

                {/* In-App */}
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AppWindow className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="delivery-in-app" className="font-medium">
                        In-App Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        See alerts when you log in to the dashboard
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="delivery-in-app"
                    checked={preferences.delivery.in_app}
                    onCheckedChange={(checked) => 
                      updatePreference('delivery.in_app', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={savePreferences} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertConfigDialog;
