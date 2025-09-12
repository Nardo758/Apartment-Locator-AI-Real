/**
 * Scraping Dashboard Component for monitoring and controlling the scraping system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Database, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Settings
} from 'lucide-react';

// Import scraping system (these would be actual imports in a real implementation)
interface ScrapingStats {
  totalPropertiesScraped: number;
  successRate: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
  propertiesBySource: Record<string, number>;
  lastSuccessfulScrape: Date;
}

interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

interface ScrapingJob {
  id: string;
  source: string;
  city: string;
  state: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
}

const ScrapingDashboard: React.FC = () => {
  const [stats, setStats] = useState<ScrapingStats>({
    totalPropertiesScraped: 15420,
    successRate: 0.94,
    averageResponseTime: 2340,
    errorsByType: {
      'rate_limit': 23,
      'network': 45,
      'parsing': 12,
      'blocked': 8
    },
    propertiesBySource: {
      'apartments.com': 8920,
      'zillow.com': 6500
    },
    lastSuccessfulScrape: new Date()
  });

  const [tasks, setTasks] = useState<ScheduledTask[]>([
    {
      id: 'daily_scrape_all',
      name: 'Daily Comprehensive Scraping',
      schedule: '0 2 * * *',
      enabled: true,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000)
    },
    {
      id: 'hourly_priority_cities',
      name: 'Hourly Priority Cities Update',
      schedule: '0 * * * *',
      enabled: true,
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      nextRun: new Date(Date.now() + 30 * 60 * 1000)
    },
    {
      id: 'weekly_full_scrape',
      name: 'Weekly Full Market Scrape',
      schedule: '0 0 * * 0',
      enabled: false,
      nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [activeJobs, setActiveJobs] = useState<ScrapingJob[]>([
    {
      id: 'job_1',
      source: 'apartments.com',
      city: 'austin',
      state: 'tx',
      status: 'running',
      startedAt: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'job_2',
      source: 'zillow.com',
      city: 'dallas',
      state: 'tx',
      status: 'completed',
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 1000)
    }
  ]);

  const [isSchedulerRunning, setIsSchedulerRunning] = useState(true);

  const handleToggleScheduler = () => {
    setIsSchedulerRunning(!isSchedulerRunning);
    // In real implementation: taskScheduler.start() or taskScheduler.stop()
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, enabled: !task.enabled }
        : task
    ));
    // In real implementation: taskScheduler.toggleTask(taskId, !task.enabled)
  };

  const handleRunTaskNow = (taskId: string) => {
    // In real implementation: taskScheduler.runTaskNow(taskId)
    console.log(`Running task ${taskId} now`);
  };

  const handleManualScrape = () => {
    // In real implementation: scraperOrchestrator.scrapeAllCities()
    console.log('Starting manual scrape');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${diffDays}d`;
  };

  const getStatusBadge = (status: ScrapingJob['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'success',
      failed: 'destructive',
      cancelled: 'outline'
    } as const;

    const icons = {
      pending: Clock,
      running: RefreshCw,
      completed: CheckCircle,
      failed: AlertCircle,
      cancelled: AlertCircle
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status] as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control the apartment data scraping system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Scheduler</span>
            <Switch 
              checked={isSchedulerRunning} 
              onCheckedChange={handleToggleScheduler}
            />
            <Badge variant={isSchedulerRunning ? 'success' : 'secondary'}>
              {isSchedulerRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>
          <Button onClick={handleManualScrape} className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Manual Scrape
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPropertiesScraped.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last updated {formatTimeAgo(stats.lastSuccessfulScrape)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</div>
            <Progress value={stats.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Per request average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.propertiesBySource).length}</div>
            <p className="text-xs text-muted-foreground">
              Scraping sources active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Tasks</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Scraping Jobs</CardTitle>
              <CardDescription>
                Currently running and recent scraping operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusBadge(job.status)}
                      <div>
                        <div className="font-medium">
                          {job.source} - {job.city}, {job.state.toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {job.status === 'running' && job.startedAt && 
                            `Started ${formatTimeAgo(job.startedAt)}`
                          }
                          {job.status === 'completed' && job.completedAt && 
                            `Completed ${formatTimeAgo(job.completedAt)}`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'running' && (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tasks</CardTitle>
              <CardDescription>
                Automated scraping tasks and their schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={task.enabled} 
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Schedule: {task.schedule}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.lastRun && `Last run: ${formatTimeAgo(task.lastRun)}`}
                          {' • '}
                          Next run: {formatTimeUntil(task.nextRun)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRunTaskNow(task.id)}
                      >
                        Run Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Properties scraped by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.propertiesBySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{source}</Badge>
                      <span className="font-medium">{count.toLocaleString()} properties</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((count / stats.totalPropertiesScraped) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Common errors and their frequencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.errorsByType).map(([errorType, count]) => (
                  <div key={errorType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="font-medium capitalize">{errorType.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="destructive">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingDashboard;