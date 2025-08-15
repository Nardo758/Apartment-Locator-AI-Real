import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Billing: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app, this would come from Supabase/Stripe
  const [subscription] = useState({
    plan: 'Pro',
    status: 'active',
    nextBilling: '2024-09-15',
    amount: 47,
    searches: 150,
    searchesUsed: 89,
    offers: 25,
    offersUsed: 12
  });

  const [invoices] = useState([
    { id: 'inv_001', date: '2024-08-15', amount: 47, status: 'paid', download: true },
    { id: 'inv_002', date: '2024-07-15', amount: 47, status: 'paid', download: true },
    { id: 'inv_003', date: '2024-06-15', amount: 47, status: 'paid', download: true },
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
                <CreditCard className="text-primary" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Billing & Subscription
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{subscription.plan} Plan</h3>
                  <p className="text-muted-foreground">
                    ${subscription.amount}/month • Next billing: {formatDate(subscription.nextBilling)}
                  </p>
                </div>
                <Button variant="outline">Change Plan</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Searches Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Searches</span>
                    <span>{subscription.searchesUsed}/{subscription.searches}</span>
                  </div>
                  <Progress 
                    value={(subscription.searchesUsed / subscription.searches) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Resets on {formatDate(subscription.nextBilling)}
                  </p>
                </div>

                {/* Offers Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Offers Generated</span>
                    <span>{subscription.offersUsed}/{subscription.offers}</span>
                  </div>
                  <Progress 
                    value={(subscription.offersUsed / subscription.offers) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Resets on {formatDate(subscription.nextBilling)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-muted-foreground" size={24} />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={20} />
                      <div>
                        <p className="font-medium">${invoice.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        Paid
                      </Badge>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle size={20} />
                Usage Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-yellow-800">Approaching Search Limit</p>
                    <p className="text-sm text-yellow-700">
                      You've used {subscription.searchesUsed} of {subscription.searches} searches this month.
                      Consider upgrading to avoid interruptions.
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Billing;