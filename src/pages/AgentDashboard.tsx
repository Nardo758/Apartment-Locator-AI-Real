import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadCaptureForm } from '@/components/agent/LeadCaptureForm';
import { ClientPortfolio } from '@/components/agent/ClientPortfolio';
import { CommissionCalculator } from '@/components/agent/CommissionCalculator';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  Calculator,
  FileText,
  Bell,
  Settings,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';

type TabType = 'overview' | 'clients' | 'lead-capture' | 'calculator' | 'reports';

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const stats = {
    totalClients: 8,
    activeDeals: 5,
    monthlyCommissions: 2625,
    projectedRevenue: 31500,
    thisMonthLeads: 12,
    conversionRate: 62,
    avgCommission: 525,
    nextMoveIn: '5 days'
  };

  const recentActivity = [
    { 
      type: 'lead', 
      message: 'New lead: David Kim added', 
      time: '2 hours ago',
      icon: Users,
      color: 'text-purple-400'
    },
    { 
      type: 'offer', 
      message: 'Sarah Johnson made an offer on 2-bed in Manhattan', 
      time: '5 hours ago',
      icon: FileText,
      color: 'text-blue-400'
    },
    { 
      type: 'viewing', 
      message: 'Emily Rodriguez scheduled 3 property viewings', 
      time: '1 day ago',
      icon: Calendar,
      color: 'text-green-400'
    },
    { 
      type: 'closed', 
      message: 'James Wilson signed lease - $630 commission!', 
      time: '3 days ago',
      icon: CheckCircle,
      color: 'text-green-400'
    }
  ];

  const upcomingTasks = [
    { task: 'Follow up with Sarah Johnson', priority: 'high', due: 'Today' },
    { task: 'Property viewing with Michael Chen', priority: 'high', due: 'Tomorrow' },
    { task: 'Send market report to Lisa Anderson', priority: 'medium', due: 'Feb 10' },
    { task: 'Update client portfolio photos', priority: 'low', due: 'Feb 15' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'lead-capture', label: 'Capture Lead', icon: Plus },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Manage your clients and track commissions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/20 hover:bg-white/5">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500/20 text-red-300">3</Badge>
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5">
                <Settings className="w-4 h-4" />
              </Button>
              <Link to="/agent-pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="elevated" className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-white mb-1">{stats.totalClients}</p>
                  <p className="text-xs text-green-400">+2 this month</p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">Active Deals</p>
                  <p className="text-3xl font-bold text-white mb-1">{stats.activeDeals}</p>
                  <p className="text-xs text-green-400">{stats.conversionRate}% conversion</p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-500/20 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(stats.monthlyCommissions)}</p>
                  <p className="text-xs text-white/60">Avg: {formatCurrency(stats.avgCommission)}</p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-pink-500/20 p-3 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-pink-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">Projected (Annual)</p>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(stats.projectedRevenue)}</p>
                  <p className="text-xs text-white/60">Based on pipeline</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => {
                      const Icon = activity.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className={`${activity.color} mt-0.5`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.message}</p>
                            <p className="text-white/50 text-xs mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Upcoming Tasks
                  </CardTitle>
                  <CardDescription>Stay on top of your follow-ups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-purple-600"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">{task.task}</p>
                          <p className="text-white/50 text-xs mt-1">Due: {task.due}</p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-white/20 hover:bg-white/5">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to speed up your workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setActiveTab('lead-capture')}
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Capture Lead</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('calculator')}
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Calculator className="w-6 h-6" />
                    <span>Calculate Commission</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('reports')}
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Generate Report</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('clients')}
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    <Users className="w-6 h-6" />
                    <span>View Clients</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <ClientPortfolio />
          </div>
        )}

        {/* Lead Capture Tab */}
        {activeTab === 'lead-capture' && (
          <div>
            <LeadCaptureForm />
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div>
            <CommissionCalculator />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card variant="elevated" className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Professional Reports
              </CardTitle>
              <CardDescription>Generate reports for clients and your records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-32 flex flex-col gap-3 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <FileText className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">Client Portfolio Report</p>
                    <p className="text-xs text-white/70">Comprehensive client overview</p>
                  </div>
                </Button>
                <Button className="h-32 flex flex-col gap-3 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <BarChart3 className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">Commission Summary</p>
                    <p className="text-xs text-white/70">Monthly earnings breakdown</p>
                  </div>
                </Button>
                <Button className="h-32 flex flex-col gap-3 bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">Performance Analytics</p>
                    <p className="text-xs text-white/70">Conversion rates & trends</p>
                  </div>
                </Button>
                <Button className="h-32 flex flex-col gap-3 bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                  <Users className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">Client Activity Report</p>
                    <p className="text-xs text-white/70">Engagement & interactions</p>
                  </div>
                </Button>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-6">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Premium report templates available with Professional plan
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
