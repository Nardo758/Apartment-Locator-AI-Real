import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  DollarSign, Brain, Shield, Zap, Bell, Menu, ChevronRight, 
  TrendingUp, AlertTriangle, Eye, Settings, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mobile-optimized metric card
const MobileMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  onClick 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  onClick?: () => void;
}) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`${color} rounded-lg p-4 text-white cursor-pointer`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-xs font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-white/70 text-xs mt-1">{subtitle}</p>
      </div>
      <Icon className="h-6 w-6 text-white/80" />
    </div>
  </motion.div>
);

// Mobile alert component
const MobileAlert = ({ alert }: { alert: any }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-3 rounded-lg border-l-4 ${
      alert.priority === 'high' 
        ? 'border-red-500 bg-red-50' 
        : alert.priority === 'medium'
        ? 'border-orange-500 bg-orange-50'
        : 'border-blue-500 bg-blue-50'
    }`}
  >
    <div className="flex items-start space-x-2">
      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
        alert.priority === 'high' ? 'text-red-500' : 
        alert.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'
      }`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{alert.title}</h4>
        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
      </div>
    </div>
  </motion.div>
);

// Mobile navigation
const MobileNav = ({ activeSection, onSectionChange }: { 
  activeSection: string, 
  onSectionChange: (section: string) => void 
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 3 },
    { id: 'competitors', label: 'Competitors', icon: Eye },
    { id: 'recommendations', label: 'AI Recommendations', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Access all pricing intelligence features
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={() => onSectionChange(item.id)}
            >
              <div className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Main mobile dashboard
export const MobileOptimizedDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Mock data
  const metrics = {
    revenue: { value: '$127K', subtitle: 'Annual gain', color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    ml: { value: '84.7%', subtitle: 'ML accuracy', color: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
    risk: { value: '45', subtitle: 'Risk score', color: 'bg-gradient-to-r from-red-500 to-pink-600' },
    automation: { value: '92%', subtitle: 'Success rate', color: 'bg-gradient-to-r from-orange-500 to-amber-600' }
  };

  const alerts = [
    {
      title: 'Unit 001 Needs Action',
      message: '45 days on market - consider price reduction',
      priority: 'high'
    },
    {
      title: 'Competitor Alert',
      message: 'Riverside Commons reduced rent by 5%',
      priority: 'medium'
    },
    {
      title: 'ML Recommendation',
      message: 'New pricing opportunities identified',
      priority: 'low'
    }
  ];

  const quickActions = [
    { label: 'View Alerts', icon: Bell, count: 3, color: 'text-red-500' },
    { label: 'Check Competitors', icon: Eye, color: 'text-blue-500' },
    { label: 'AI Insights', icon: Brain, color: 'text-purple-500' },
    { label: 'Risk Status', icon: Shield, color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Pricing</h1>
              <p className="text-xs text-gray-600">Revenue optimization</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <MobileMetricCard
            title="Revenue Impact"
            value={metrics.revenue.value}
            subtitle={metrics.revenue.subtitle}
            icon={DollarSign}
            color={metrics.revenue.color}
            onClick={() => setActiveSection('revenue')}
          />
          <MobileMetricCard
            title="ML Engine"
            value={metrics.ml.value}
            subtitle={metrics.ml.subtitle}
            icon={Brain}
            color={metrics.ml.color}
            onClick={() => setActiveSection('ml')}
          />
          <MobileMetricCard
            title="Portfolio Risk"
            value={metrics.risk.value}
            subtitle={metrics.risk.subtitle}
            icon={Shield}
            color={metrics.risk.color}
            onClick={() => setActiveSection('risk')}
          />
          <MobileMetricCard
            title="Automation"
            value={metrics.automation.value}
            subtitle={metrics.automation.subtitle}
            icon={Zap}
            color={metrics.automation.color}
            onClick={() => setActiveSection('automation')}
          />
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setActiveSection(action.label.toLowerCase().replace(' ', ''))}
                >
                  <div className="relative">
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    {action.count && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-2 text-center">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Priority Alerts</CardTitle>
              <Badge className="bg-red-100 text-red-800">
                {alerts.filter(a => a.priority === 'high').length} urgent
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 3).map((alert, index) => (
              <MobileAlert key={index} alert={alert} />
            ))}
            <Button variant="outline" size="sm" className="w-full mt-3">
              View All Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Performance summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pricing Actions</span>
                <span className="font-semibold">15 completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Optimized</span>
                <span className="font-semibold text-green-600">+$3,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Units Analyzed</span>
                <span className="font-semibold">47 units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Competitor Updates</span>
                <span className="font-semibold">8 detected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'ML Engine', status: 'Active', color: 'text-green-600' },
                { name: 'Competitor Monitoring', status: 'Live', color: 'text-green-600' },
                { name: 'Automated Pricing', status: 'Running', color: 'text-green-600' },
                { name: 'Risk Management', status: 'Monitoring', color: 'text-green-600' }
              ].map((system, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{system.name}</span>
                  <Badge className={`${
                    system.color === 'text-green-600' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {system.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Unit 003 price adjusted', time: '2 mins ago', type: 'pricing' },
                { action: 'Competitor alert triggered', time: '15 mins ago', type: 'alert' },
                { action: 'ML model updated', time: '1 hour ago', type: 'system' },
                { action: 'Risk assessment completed', time: '2 hours ago', type: 'analysis' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'pricing' ? 'bg-blue-500' :
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'system' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileOptimizedDashboard;