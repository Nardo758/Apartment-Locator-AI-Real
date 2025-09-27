import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const TestIntegration: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setMessage('Testing connection...');

    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        throw error;
      }

      setConnectionStatus('success');
      setMessage('✅ Supabase connection successful!');
    } catch (error) {
      setConnectionStatus('error');
      setMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testAuth = async () => {
    setConnectionStatus('testing');
    setMessage('Testing auth...');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      setConnectionStatus('success');
      setMessage(session ? '✅ User is authenticated' : '✅ Auth system working (no active session)');
    } catch (error) {
      setConnectionStatus('error');
      setMessage(`❌ Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button 
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          variant="outline"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Database'}
        </Button>
        
        <Button 
          onClick={testAuth}
          disabled={connectionStatus === 'testing'}
          variant="outline"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Auth'}
        </Button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md border ${getStatusColor()}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</p>
        <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'}</p>
      </div>
    </div>
  );
};