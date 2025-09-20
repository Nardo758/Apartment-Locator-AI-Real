import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Calendar, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';

const Billing: React.FC = () => {
  
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
    <ModernPageLayout
      title="Billing & Subscription"
      subtitle="Manage your subscription, payment methods, and billing history"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >
      <div className={designSystem.spacing.content}>
        {/* Plan Status Overview */}
        <ModernCard 
          className={`${designSystem.animations.entrance} mb-8`}
          gradient
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                  {subscription.plan} Plan
                </h2>
                <p className={designSystem.typography.body}>
                  ${subscription.amount}/month • Next billing: {formatDate(subscription.nextBilling)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
              <Link to="/pricing">
                <Button variant="outline">Change Plan</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Searches Usage */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">AI Searches</span>
                <span className="font-bold">{subscription.searchesUsed}/{subscription.searches}</span>
              </div>
              <Progress 
                value={(subscription.searchesUsed / subscription.searches) * 100} 
                className="h-3 mb-2"
              />
              <p className={`text-xs ${designSystem.colors.muted}`}>
                Resets on {formatDate(subscription.nextBilling)}
              </p>
            </div>

            {/* Offers Usage */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">AI Offers Generated</span>
                <span className="font-bold">{subscription.offersUsed}/{subscription.offers}</span>
              </div>
              <Progress 
                value={(subscription.offersUsed / subscription.offers) * 100} 
                className="h-3 mb-2"
              />
              <p className={`text-xs ${designSystem.colors.muted}`}>
                Resets on {formatDate(subscription.nextBilling)}
              </p>
            </div>
          </div>
        </ModernCard>

        {/* Payment Method */}
        <ModernCard 
          title="Payment Method"
          icon={<CreditCard className="w-6 h-6 text-blue-600" />}
          animate
          animationDelay={100}
          className="mb-8"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className={`text-sm ${designSystem.colors.muted}`}>Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </ModernCard>

        {/* Billing History */}
        <ModernCard 
          title="Billing History"
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          animate
          animationDelay={200}
          className="mb-8"
        >
          <div className={designSystem.spacing.items}>
            {invoices.map((invoice, index) => (
              <div
                key={invoice.id}
                className={`flex items-center justify-between p-4 ${designSystem.backgrounds.section} rounded-lg ${designSystem.animations.entrance}`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">${invoice.amount}</p>
                    <p className={`text-sm ${designSystem.colors.muted}`}>
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
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
        </ModernCard>

        {/* Usage Alerts */}
        <ModernCard 
          title="Usage Alerts"
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
          animate
          animationDelay={300}
        >
          <div className={designSystem.spacing.content}>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <AlertCircle className="text-yellow-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                  Approaching Search Limit
                </p>
                <p className={`text-sm text-yellow-700 dark:text-yellow-500`}>
                  You've used {subscription.searchesUsed} of {subscription.searches} searches this month.
                  Consider upgrading to avoid interruptions.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/pricing">
                <Button className={`${designSystem.buttons.primary} gap-2`}>
                  <Zap className="w-4 h-4" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        </ModernCard>
      </div>
    </ModernPageLayout>
  );
};

export default Billing;