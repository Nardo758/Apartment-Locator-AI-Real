import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Lock, WifiOff, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'auth' | 'server' | 'client';
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'client',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message or properties
    let errorType: State['errorType'] = 'client';
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('failed to fetch')) {
      errorType = 'network';
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      errorType = 'auth';
    } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
      errorType = 'server';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorType: this.state.errorType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    this.setState({
      errorInfo,
    });

    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'client',
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    
    const bugReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Open email client with pre-filled bug report
    const subject = encodeURIComponent('Bug Report - Apartment Locator AI');
    const body = encodeURIComponent(
      `Please describe what you were doing when the error occurred:\n\n---\n\nError Details:\n${JSON.stringify(bugReport, null, 2)}`
    );
    
    window.location.href = `mailto:support@apartmentlocatorai.com?subject=${subject}&body=${body}`;
  };

  renderNetworkError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Lost
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to our servers. Please check your internet connection and try again.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={this.handleGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  renderAuthError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This could mean:
          </p>

          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Your session has expired
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              You need to upgrade your plan
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              This feature requires authentication
            </li>
          </ul>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Sign In
            </Button>
            
            <Button 
              onClick={this.handleGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderServerError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Server Error (500)
          </h1>
          
          <p className="text-gray-600 mb-6">
            Oops! Something went wrong on our end. Our team has been notified and we're working on fixing it.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            
            <Button 
              onClick={this.handleGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>

            <Button 
              onClick={this.handleReportBug}
              variant="ghost"
              className="w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Error ID: {Date.now().toString(36)}
          </p>
        </div>
      </div>
    );
  }

  renderClientError() {
    const { error } = this.state;
    const isDevelopment = import.meta.env.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h1>
            
            <p className="text-gray-600">
              We encountered an unexpected error. Don't worry, we've logged it and will look into it.
            </p>
          </div>

          {isDevelopment && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900 mb-2">Error Details (Development Only):</p>
              <pre className="text-xs text-red-800 overflow-auto max-h-48">
                {error.toString()}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={this.handleReload}
                variant="outline"
              >
                Reload Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Homepage
              </Button>
            </div>

            <Button 
              onClick={this.handleReportBug}
              variant="ghost"
              className="w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report This Issue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render appropriate error page based on error type
      switch (this.state.errorType) {
        case 'network':
          return this.renderNetworkError();
        case 'auth':
          return this.renderAuthError();
        case 'server':
          return this.renderServerError();
        case 'client':
        default:
          return this.renderClientError();
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
