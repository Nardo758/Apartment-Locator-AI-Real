import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingDown, TrendingUp, AlertTriangle, Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/authHelpers';

interface Alert {
  id: string;
  type: 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  property_id?: string;
  property_name?: string;
  created_at: string;
  read: boolean;
  dismissed: boolean;
}

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch('/api/alerts');

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        setAlerts(getMockAlerts());
        return;
      }

      const data = await response.json();
      setAlerts(data.alerts || getMockAlerts());
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts(getMockAlerts());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAlerts = (): Alert[] => [
    {
      id: '1',
      type: 'price_change',
      title: 'Competitor Price Drop',
      message: 'Sunrise Apartments reduced rent by $150/mo on 2BR units',
      severity: 'high',
      property_name: 'Sunrise Apartments',
      created_at: new Date().toISOString(),
      read: false,
      dismissed: false,
    },
    {
      id: '2',
      type: 'vacancy_risk',
      title: 'High Vacancy Alert',
      message: 'Portfolio vacancy rate reached 12%, above market average',
      severity: 'medium',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      dismissed: false,
    },
  ];

  const markAsRead = async (alertId: string) => {
    try {
      const response = await authenticatedFetch(`/api/alerts/${alertId}/read`, {
        method: 'PATCH',
      });

      if (response.status === 401) {
        return;
      }

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await authenticatedFetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
      });

      if (response.status === 401) {
        return;
      }

      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      toast({
        title: 'Alert dismissed',
        description: 'The alert has been removed.',
      });
    } catch (error) {
      console.error('Error dismissing alert:', error);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'concession':
        return <TrendingDown className="h-4 w-4" />;
      case 'vacancy_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'market_trend':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay informed about important changes to your properties
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No alerts at this time</p>
            <p className="text-sm">You'll be notified when there are important updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  alert.read ? 'bg-background' : 'bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${
                      alert.severity === 'high' ? 'text-destructive' :
                      alert.severity === 'medium' ? 'text-warning' :
                      'text-muted-foreground'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      {alert.property_name && (
                        <p className="text-xs text-muted-foreground">
                          Property: {alert.property_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!alert.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length > 5 && (
              <Button variant="outline" className="w-full" onClick={() => {}}>
                View All {alerts.length} Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
