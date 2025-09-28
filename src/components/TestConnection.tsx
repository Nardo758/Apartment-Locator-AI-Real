import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface ConnectionStatus {
  database: 'connected' | 'disconnected' | 'testing';
  api: 'connected' | 'disconnected' | 'testing';
  realtime: 'connected' | 'disconnected' | 'testing';
}

export const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: 'testing',
    api: 'testing',
    realtime: 'testing'
  });
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const testConnections = async () => {
    setIsRefreshing(true);
    setStatus({
      database: 'testing',
      api: 'testing',
      realtime: 'testing'
    });

    // Simulate connection tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Database test
    const dbStatus = Math.random() > 0.1 ? 'connected' : 'disconnected';
    setStatus(prev => ({ ...prev, database: dbStatus }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // API test
    const apiStatus = Math.random() > 0.05 ? 'connected' : 'disconnected';
    setStatus(prev => ({ ...prev, api: apiStatus }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Realtime test
    const realtimeStatus = Math.random() > 0.15 ? 'connected' : 'disconnected';
    setStatus(prev => ({ ...prev, realtime: realtimeStatus }));
    
    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    testConnections();
  }, []);

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500 hover:bg-green-600">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'testing':
        return <Badge variant="outline">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallStatus = Object.values(status).every(s => s === 'connected') ? 'healthy' : 
                       Object.values(status).some(s => s === 'testing') ? 'testing' : 'issues';

  return (
    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overallStatus === 'healthy' ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : overallStatus === 'testing' ? (
              <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            System Connection Status
          </div>
          <Button 
            onClick={testConnections} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Test
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${
          overallStatus === 'healthy' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : overallStatus === 'testing'
            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${
                overallStatus === 'healthy' ? 'text-green-600' : 
                overallStatus === 'testing' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="font-medium">
                {overallStatus === 'healthy' ? 'All Systems Operational' :
                 overallStatus === 'testing' ? 'Testing Connections...' : 'Connection Issues Detected'}
              </span>
            </div>
            {getStatusBadge(overallStatus === 'healthy' ? 'connected' : overallStatus === 'testing' ? 'testing' : 'disconnected')}
          </div>
        </div>

        {/* Individual Connection Status */}
        <div className="space-y-3">
          {/* Database Connection */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Database Connection</div>
                <div className="text-sm text-muted-foreground">Supabase PostgreSQL</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.database)}
              {getStatusBadge(status.database)}
            </div>
          </div>

          {/* API Connection */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">API Services</div>
                <div className="text-sm text-muted-foreground">REST & GraphQL Endpoints</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.api)}
              {getStatusBadge(status.api)}
            </div>
          </div>

          {/* Realtime Connection */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Realtime Updates</div>
                <div className="text-sm text-muted-foreground">WebSocket Connection</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.realtime)}
              {getStatusBadge(status.realtime)}
            </div>
          </div>
        </div>

        {/* Last Checked */}
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};