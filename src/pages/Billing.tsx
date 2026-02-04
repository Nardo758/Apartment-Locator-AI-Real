import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Calendar, CheckCircle, AlertCircle, TrendingUp, Zap, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  status: string;
  planType: string;
  amount: number;
  interval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  paidAt: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

const Billing: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionData();
    }
  }, [user?.id]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/subscription-status/${user?.id}`);
      const data = await response.json();
      
      if (data.subscription) {
        setSubscription(data.subscription);
      }
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelImmediately: boolean = false) => {
    if (!subscription) return;

    const confirmed = window.confirm(
      cancelImmediately 
        ? 'Are you sure you want to cancel immediately? You will lose access right away.'
        : 'Are you sure you want to cancel at the end of the billing period?'
    );

    if (!confirmed) return;

    try {
      setCanceling(true);
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          cancelImmediately
        })
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      toast({
        title: 'Success',
        description: cancelImmediately 
          ? 'Subscription canceled immediately'
          : 'Subscription will cancel at the end of the billing period',
      });

      fetchSubscriptionData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive'
      });
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getPlanName = (planType: string) => {
    const names: Record<string, string> = {
      landlord_starter: 'Landlord Starter',
      landlord_pro: 'Landlord Professional',
      landlord_enterprise: 'Landlord Enterprise',
      agent_basic: 'Agent Basic',
      agent_team: 'Agent Team',
      agent_brokerage: 'Agent Brokerage',
      renter_paid: 'Renter Full Access'
    };
    return names[planType] || planType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <ModernPageLayout title="Billing & Subscription" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernPageLayout>
    );
  }

  // No subscription - show free tier or renter one-time payment
  if (!subscription) {
    return (
      <ModernPageLayout
        title="Billing & Subscription"
        subtitle="You're currently on the free tier"
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
          <ModernCard className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Upgrade Your Experience</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Get access to premium features and unlock the full potential of Apartment Locator AI
              </p>
              <Link to="/pricing">
                <Button size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </ModernCard>
        </div>
      </ModernPageLayout>
    );
  }

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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                  {getPlanName(subscription.planType)}
                </h2>
                <p className={designSystem.typography.body}>
                  ${formatCurrency(subscription.amount)}/{subscription.interval} • 
                  {subscription.cancelAtPeriodEnd 
                    ? ` Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                    : ` Next billing: ${formatDate(subscription.currentPeriodEnd)}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status === 'trialing' && subscription.trialEnd && (
                  <>Trial until {formatDate(subscription.trialEnd)}</>
                )}
                {subscription.status === 'active' && <><CheckCircle className="w-3 h-3 mr-1" />Active</>}
                {subscription.status === 'past_due' && <><AlertCircle className="w-3 h-3 mr-1" />Past Due</>}
                {subscription.status === 'canceled' && <><XCircle className="w-3 h-3 mr-1" />Canceled</>}
              </Badge>
              {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                <Link to="/pricing">
                  <Button variant="outline" size="sm">Change Plan</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Trial Progress */}
          {subscription.status === 'trialing' && subscription.trialEnd && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Free Trial Period</span>
                <span className="font-bold">Ends {formatDate(subscription.trialEnd)}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enjoy full access during your trial. You won't be charged until {formatDate(subscription.trialEnd)}
              </p>
            </div>
          )}

          {/* Cancel Warning */}
          {subscription.cancelAtPeriodEnd && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-orange-800 dark:text-orange-400 mb-1">
                    Subscription Ending
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-500">
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                    You'll retain access until then.
                  </p>
                </div>
              </div>
            </div>
          )}
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
                <p className="font-medium">Managed by Stripe</p>
                <p className={`text-sm ${designSystem.colors.muted}`}>
                  Update your payment method in the customer portal
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
            >
              Update
            </Button>
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
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
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
                      <p className="font-medium">${formatCurrency(invoice.amount)}</p>
                      <p className={`text-sm ${designSystem.colors.muted}`}>
                        {formatDate(invoice.paidAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {invoice.status}
                    </Badge>
                    {invoice.invoicePdf && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => window.open(invoice.invoicePdf, '_blank')}
                      >
                        <Download size={16} />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCard>

        {/* Subscription Actions */}
        {subscription.status !== 'canceled' && !subscription.cancelAtPeriodEnd && (
          <ModernCard 
            title="Subscription Actions"
            icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
            animate
            animationDelay={300}
          >
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-medium mb-2">Cancel Subscription</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelSubscription(false)}
                    disabled={canceling}
                  >
                    {canceling ? 'Canceling...' : 'Cancel at Period End'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelSubscription(true)}
                    disabled={canceling}
                  >
                    {canceling ? 'Canceling...' : 'Cancel Immediately'}
                  </Button>
                </div>
              </div>
            </div>
          </ModernCard>
        )}
      </div>
    </ModernPageLayout>
  );
};

export default Billing;
