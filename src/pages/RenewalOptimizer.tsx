import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Mail,
  User,
  Clock,
  Target,
  FileText,
  MessageSquare
} from 'lucide-react';

type TimeFrame = '30' | '60' | '90' | 'all';
type RenewalStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'negotiating';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  unitNumber: string;
  currentRent: number;
  leaseStart: string;
  leaseEnd: string;
  daysUntilExpiration: number;
  timeInUnit: number; // months
  paymentHistory: number; // % on-time
  renewalStatus: RenewalStatus;
  marketAvgRent: number;
  recommendedRent: number;
  incentive?: string;
  successProbability: number;
  turnoverCost: number;
  lastContactDate?: string;
  notes?: string;
}

// Mock data
const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    propertyAddress: '1234 Main St',
    unitNumber: '203',
    currentRent: 1800,
    leaseStart: '2024-04-01',
    leaseEnd: '2026-03-06',
    daysUntilExpiration: 30,
    timeInUnit: 18,
    paymentHistory: 100,
    renewalStatus: 'pending',
    marketAvgRent: 1900,
    recommendedRent: 1850,
    incentive: 'Waive pet deposit ($300)',
    successProbability: 87,
    turnoverCost: 1200,
    notes: 'Great tenant, always pays on time'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    propertyAddress: '5678 Oak Ave',
    unitNumber: '12',
    currentRent: 2200,
    leaseStart: '2024-02-15',
    leaseEnd: '2026-03-15',
    daysUntilExpiration: 39,
    timeInUnit: 24,
    paymentHistory: 100,
    renewalStatus: 'sent',
    marketAvgRent: 2100,
    recommendedRent: 2150,
    successProbability: 92,
    turnoverCost: 1400,
    lastContactDate: '2026-02-01'
  },
  {
    id: '3',
    name: 'Lisa Davis',
    email: 'lisa.davis@email.com',
    phone: '(555) 345-6789',
    propertyAddress: '999 Congress Ave',
    unitNumber: '4B',
    currentRent: 2500,
    leaseStart: '2024-05-20',
    leaseEnd: '2026-04-20',
    daysUntilExpiration: 75,
    timeInUnit: 21,
    paymentHistory: 95,
    renewalStatus: 'pending',
    marketAvgRent: 2400,
    recommendedRent: 2450,
    incentive: 'Free parking ($150/mo value)',
    successProbability: 78,
    turnoverCost: 1500
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    phone: '(555) 456-7890',
    propertyAddress: '2468 River Rd',
    unitNumber: '305',
    currentRent: 1600,
    leaseStart: '2024-06-01',
    leaseEnd: '2026-05-01',
    daysUntilExpiration: 86,
    timeInUnit: 20,
    paymentHistory: 100,
    renewalStatus: 'accepted',
    marketAvgRent: 1700,
    recommendedRent: 1650,
    successProbability: 95,
    turnoverCost: 1100,
    lastContactDate: '2026-01-25'
  },
  {
    id: '5',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 567-8901',
    propertyAddress: '7890 Market St',
    unitNumber: '8',
    currentRent: 1900,
    leaseStart: '2024-08-15',
    leaseEnd: '2026-03-25',
    daysUntilExpiration: 49,
    timeInUnit: 17,
    paymentHistory: 98,
    renewalStatus: 'negotiating',
    marketAvgRent: 2000,
    recommendedRent: 1950,
    successProbability: 82,
    turnoverCost: 1250,
    lastContactDate: '2026-02-03'
  }
];

export default function RenewalOptimizer() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30');
  const [tenants] = useState(mockTenants);

  const filteredTenants = tenants.filter(t => {
    if (timeFrame === 'all') return true;
    return t.daysUntilExpiration <= parseInt(timeFrame);
  });

  const stats = {
    total: tenants.length,
    expiring30: tenants.filter(t => t.daysUntilExpiration <= 30).length,
    expiring60: tenants.filter(t => t.daysUntilExpiration <= 60).length,
    expiring90: tenants.filter(t => t.daysUntilExpiration <= 90).length,
    sent: tenants.filter(t => t.renewalStatus === 'sent').length,
    accepted: tenants.filter(t => t.renewalStatus === 'accepted').length,
    avgSuccessRate: Math.round(tenants.reduce((sum, t) => sum + t.successProbability, 0) / tenants.length),
    potentialLoss: tenants.filter(t => t.daysUntilExpiration <= 30 && t.renewalStatus === 'pending')
                          .reduce((sum, t) => sum + t.turnoverCost, 0)
  };

  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'PENDING'
    },
    sent: {
      icon: <Mail className="w-4 h-4" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: 'OFFER SENT'
    },
    accepted: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'ACCEPTED'
    },
    declined: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'DECLINED'
    },
    negotiating: {
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      label: 'NEGOTIATING'
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Renewal Optimizer
              </h1>
              <p className="text-white/60">
                Maximize tenant renewals and prevent costly turnovers
              </p>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Mail className="w-4 h-4 mr-2" />
              Send All 30-Day Offers
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.expiring30}
                </div>
                <div className="text-xs text-white/60">Expiring 30d</div>
              </div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.expiring60}
                </div>
                <div className="text-xs text-white/60">Expiring 60d</div>
              </div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {stats.accepted}
                </div>
                <div className="text-xs text-white/60">Accepted</div>
              </div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {stats.sent}
                </div>
                <div className="text-xs text-white/60">Offers Sent</div>
              </div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.avgSuccessRate}%
                </div>
                <div className="text-xs text-white/60">Avg Success</div>
              </div>
            </Card>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  ${(stats.potentialLoss / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-white/60">At Risk</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Frame Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-white/60 text-sm">Show:</span>
          {[
            { value: '30', label: '30 Days' },
            { value: '60', label: '60 Days' },
            { value: '90', label: '90 Days' },
            { value: 'all', label: 'All' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFrame(option.value as TimeFrame)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeFrame === option.value
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tenant List */}
        <div className="space-y-4">
          {filteredTenants.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/70 mb-2">
                No leases expiring in this timeframe
              </h3>
            </Card>
          ) : (
            filteredTenants.map((tenant) => {
              const status = statusConfig[tenant.renewalStatus];
              const urgency = tenant.daysUntilExpiration <= 30 ? 'high' : 
                             tenant.daysUntilExpiration <= 60 ? 'medium' : 'low';
              const netBenefit = (tenant.recommendedRent - tenant.currentRent) * 12 - tenant.turnoverCost;

              return (
                <Card
                  key={tenant.id}
                  variant="elevated"
                  className={`border-l-4 ${
                    urgency === 'high' ? 'border-red-500' :
                    urgency === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {tenant.name}
                          </h3>
                          <Badge variant={
                            tenant.renewalStatus === 'accepted' ? 'success' :
                            tenant.renewalStatus === 'pending' ? 'warning' :
                            tenant.renewalStatus === 'declined' ? 'error' : 'primary'
                          }>
                            {status.icon}
                            <span className="ml-2">{status.label}</span>
                          </Badge>
                          {tenant.paymentHistory === 100 && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Perfect Payment
                            </Badge>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">
                          {tenant.propertyAddress}, Unit {tenant.unitNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          urgency === 'high' ? 'text-red-400' :
                          urgency === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {tenant.daysUntilExpiration} days
                        </div>
                        <div className="text-white/60 text-sm">until expiration</div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-white/60 text-sm mb-1">Current Rent</div>
                        <div className="text-2xl font-bold text-white">
                          ${tenant.currentRent}
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                          {tenant.timeInUnit} months in unit
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="text-blue-300 text-sm mb-1">Market Avg</div>
                        <div className="text-2xl font-bold text-blue-400">
                          ${tenant.marketAvgRent}
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          Similar units
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="text-purple-300 text-sm mb-1">Recommended</div>
                        <div className="text-2xl font-bold text-purple-400">
                          ${tenant.recommendedRent}
                        </div>
                        <div className="text-xs text-purple-300 mt-1">
                          AI suggested price
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="text-red-300 text-sm mb-1">Turnover Cost</div>
                        <div className="text-2xl font-bold text-red-400">
                          ${tenant.turnoverCost}
                        </div>
                        <div className="text-xs text-red-300 mt-1">
                          If lost
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <Card variant="highlighted" className="p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-blue-300">
                              AI Recommendation
                            </span>
                            <Badge variant="success" size="sm">
                              {tenant.successProbability}% Success Rate
                            </Badge>
                          </div>
                          <p className="text-white/80 mb-2">
                            Offer ${tenant.recommendedRent}/month
                            {tenant.incentive && (
                              <span> + <span className="text-green-400 font-semibold">{tenant.incentive}</span></span>
                            )}
                          </p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/70">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span>Net Benefit: <span className="font-semibold text-green-400">${netBenefit > 0 ? '+' : ''}{netBenefit}</span>/year</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <DollarSign className="w-4 h-4 text-blue-400" />
                              <span>Monthly Increase: ${tenant.recommendedRent - tenant.currentRent}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {tenant.phone}
                      </div>
                      {tenant.lastContactDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Last contact: {tenant.lastContactDate}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {tenant.renewalStatus === 'pending' && (
                        <>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Mail className="w-4 h-4 mr-2" />
                            Generate Renewal Letter
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </>
                      )}
                      {tenant.renewalStatus === 'sent' && (
                        <>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Follow Up
                          </Button>
                          <Button variant="outline" size="sm">
                            Mark as Accepted
                          </Button>
                        </>
                      )}
                      {tenant.renewalStatus === 'accepted' && (
                        <Button variant="outline" size="sm" className="text-green-400 border-green-500/30">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Renewed - Generate Lease
                        </Button>
                      )}
                      {tenant.renewalStatus === 'negotiating' && (
                        <>
                          <Button size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Continue Negotiation
                          </Button>
                          <Button variant="outline" size="sm">
                            Make Counter Offer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
