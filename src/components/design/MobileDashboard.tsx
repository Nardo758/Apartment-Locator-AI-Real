import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  MapPin, 
  Clock,
  Target,
  BarChart3,
  Brain,
  Zap,
  Shield,
  Eye,
  Menu,
  Bell,
  Settings,
  ArrowRight,
  Activity,
  Users,
  Calendar,
  RefreshCw,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface MobileDashboardProps {
  className?: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  className = ""
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications] = useState(5);

  const quickStats: QuickStat[] = [
    {
      label: 'Revenue',
      value: '$2.45M',
      change: '+3.2%',
      isPositive: true,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'bg-blue-500'
    },
    {
      label: 'Occupancy',
      value: '94.5%',
      change: '+1.8%',
      isPositive: true,
      icon: <Home className="w-4 h-4" />,
      color: 'bg-green-500'
    },
    {
      label: 'Avg Rent',
      value: '$2,850',
      change: '+2.1%',
      isPositive: true,
      icon: <Target className="w-4 h-4" />,
      color: 'bg-purple-500'
    },
    {
      label: 'Actions',
      value: '12',
      change: 'Pending',
      isPositive: false,
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      title: 'Unit 301 - Rent Optimized',
      description: 'Increased from $2,800 to $2,950',
      time: '2h ago',
      type: 'success'
    },
    {
      title: 'Market Analysis Complete',
      description: 'Downtown district report ready',
      time: '4h ago',
      type: 'info'
    },
    {
      title: 'Risk Alert - Unit 205',
      description: '45+ days on market',
      time: '6h ago',
      type: 'warning'
    }
  ];

  const urgentActions = [
    {
      title: 'Price Reduction Needed',
      description: 'Unit 205 - 45 days on market',
      priority: 'high',
      action: 'Reduce by 8%'
    },
    {
      title: 'Competitor Analysis',
      description: '3 new listings in area',
      priority: 'medium',
      action: 'Review pricing'
    },
    {
      title: 'Lease Renewal',
      description: 'Unit 102 expires in 30 days',
      priority: 'medium',
      action: 'Contact tenant'
    }
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Revenue Hub
              </h1>
              <p className="text-xs text-gray-600">AI-powered optimization</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveSection('overview')}
                      >
                        <BarChart3 className="w-4 h-4" />
                        Overview
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveSection('pricing')}
                      >
                        <Brain className="w-4 h-4" />
                        AI Pricing
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveSection('analytics')}
                      >
                        <Activity className="w-4 h-4" />
                        Analytics
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveSection('settings')}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                  <div className={`text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Urgent Actions */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Urgent Actions
              <Badge className="ml-auto bg-red-100 text-red-800">{urgentActions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{action.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{action.description}</div>
                  <Badge className={`${getPriorityColor(action.priority)} text-xs mt-1`}>
                    {action.priority} priority
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="ml-2 text-xs">
                  {action.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Market Opportunity</span>
              </div>
              <p className="text-xs text-gray-600">
                Rental demand is up 12% this quarter. Consider 3-5% rent increases for premium units.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Competitor Alert</span>
              </div>
              <p className="text-xs text-gray-600">
                3 new listings detected within 0.5 miles. Review pricing strategy for affected units.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">{activity.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg Days to Lease</span>
                <span className="font-medium">18 days</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="text-xs text-green-600 mt-1">25% better than market</div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Renewal Rate</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <div className="text-xs text-green-600 mt-1">Above benchmark</div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>AI Success Rate</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <div className="text-xs text-purple-600 mt-1">Recommendations accepted</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-between" variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Review Pricing
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button className="w-full justify-between" variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Assessment
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button className="w-full justify-between" variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Tenant Reports
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button className="w-full justify-between" variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Analysis
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Market Summary */}
        <Card className="hover:shadow-md transition-all mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Market Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">156</div>
                <div className="text-xs text-blue-700">Units</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">$2.4M</div>
                <div className="text-xs text-green-700">Revenue</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">94%</div>
                <div className="text-xs text-purple-700">AI Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};