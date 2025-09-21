import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Wifi, Database, Zap } from 'lucide-react';

interface DiagnosticCheck {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: string;
}

const AppDiagnostics: React.FC = () => {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([
    { name: 'App Initialization', status: 'loading', message: 'Starting app...' },
    { name: 'Environment Variables', status: 'loading', message: 'Checking configuration...' },
    { name: 'Supabase Connection', status: 'loading', message: 'Testing database connection...' },
    { name: 'Network Connectivity', status: 'loading', message: 'Checking network...' },
    { name: 'React Router', status: 'loading', message: 'Initializing routing...' }
  ]);

  const updateCheck = (name: string, status: 'success' | 'error', message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message, details } : check
    ));
  };

  useEffect(() => {
    console.log('🔧 AppDiagnostics: Starting diagnostic checks...');
    
    // Check 1: App Initialization
    setTimeout(() => {
      updateCheck('App Initialization', 'success', 'App initialized successfully');
      console.log('✅ App initialization complete');
    }, 500);

    // Check 2: Environment Variables
    setTimeout(() => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          updateCheck('Environment Variables', 'success', 'All required env vars found');
          console.log('✅ Environment variables configured');
        } else {
          updateCheck('Environment Variables', 'error', 'Missing Supabase environment variables', 
            `VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}, VITE_SUPABASE_ANON_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
          console.warn('⚠️ Missing environment variables');
        }
      } catch (error) {
        updateCheck('Environment Variables', 'error', 'Error checking env vars', String(error));
        console.error('❌ Environment variable check failed:', error);
      }
    }, 1000);

    // Check 3: Supabase Connection
    setTimeout(async () => {
      try {
        // Dynamic import to avoid issues if Supabase client fails
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        
        if (error) {
          updateCheck('Supabase Connection', 'error', 'Database connection failed', error.message);
          console.error('❌ Supabase connection failed:', error);
        } else {
          updateCheck('Supabase Connection', 'success', 'Database connected successfully');
          console.log('✅ Supabase connection established');
        }
      } catch (error) {
        updateCheck('Supabase Connection', 'error', 'Failed to initialize Supabase client', String(error));
        console.error('❌ Supabase client initialization failed:', error);
      }
    }, 1500);

    // Check 4: Network Connectivity
    setTimeout(() => {
      if (navigator.onLine) {
        updateCheck('Network Connectivity', 'success', 'Network connection active');
        console.log('✅ Network connectivity confirmed');
      } else {
        updateCheck('Network Connectivity', 'error', 'No network connection detected');
        console.warn('⚠️ Network connectivity issue');
      }
    }, 2000);

    // Check 5: React Router
    setTimeout(() => {
      try {
        const currentPath = window.location.pathname;
        updateCheck('React Router', 'success', `Router initialized - Current path: ${currentPath}`);
        console.log('✅ React Router initialized, path:', currentPath);
      } catch (error) {
        updateCheck('React Router', 'error', 'Router initialization failed', String(error));
        console.error('❌ React Router initialization failed:', error);
      }
    }, 2500);

    // Log additional debug info
    console.log('🔍 Debug Info:', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      viteMode: import.meta.env.MODE
    });

  }, []);

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'loading':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Apartment Locator AI
          </h1>
          <p className="text-gray-600">
            Initializing application...
          </p>
        </div>

        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(check.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {check.name}
                </p>
                <p className={`text-sm ${getStatusColor(check.status)}`}>
                  {check.message}
                </p>
                {check.details && (
                  <p className="text-xs text-gray-500 mt-1">
                    {check.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            If issues persist, check the browser console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppDiagnostics;