import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Database, Activity, Settings, Users, Home, Building2, Briefcase, LayoutDashboard, TrendingUp, FileText, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import { TestConnection } from '@/components/TestConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const dashboards = [
  {
    title: 'Renter Dashboard',
    description: 'Apartment search and cost calculator',
    icon: Home,
    path: '/dashboard',
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    title: 'Landlord Dashboard',
    description: 'Portfolio analytics and property management',
    icon: Building2,
    path: '/portfolio-dashboard',
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    title: 'Agent Dashboard',
    description: 'Client management and commissions',
    icon: Briefcase,
    path: '/agent-dashboard',
    color: 'bg-teal-100 text-teal-600',
    borderColor: 'border-teal-200'
  }
];

const quickLinks = [
  { title: 'Landlord Onboarding', path: '/landlord-onboarding', icon: Building2 },
  { title: 'Agent Onboarding', path: '/agent-onboarding', icon: Briefcase },
  { title: 'Landlord Pricing', path: '/landlord-pricing', icon: TrendingUp },
  { title: 'Agent Pricing', path: '/agent-pricing', icon: FileText },
  { title: 'Landing Page', path: '/', icon: Home },
];

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Full access to all user dashboards and system administration</p>
        </div>

        <Tabs defaultValue="dashboards" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboards">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="w-4 h-4 mr-2" />
              System Status
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboards" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                return (
                  <Card key={dashboard.path} className={`border-2 ${dashboard.borderColor}`}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${dashboard.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle>{dashboard.title}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={dashboard.path}>
                        <Button className="w-full" data-testid={`button-${dashboard.path.replace('/', '')}`}>
                          Open Dashboard
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Links
                </CardTitle>
                <CardDescription>Access onboarding flows and pricing pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.path} to={link.path}>
                        <Button variant="outline" className="w-full justify-start" data-testid={`link-${link.title.toLowerCase().replace(/ /g, '-')}`}>
                          <Icon className="w-4 h-4 mr-2" />
                          {link.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <TestConnection />

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Platform details and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="text-lg font-semibold">Production</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Database</p>
                    <p className="text-lg font-semibold">Supabase</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="text-lg font-semibold">US East</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-lg font-semibold">1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <CardDescription>Real-time system metrics and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Monitoring features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
