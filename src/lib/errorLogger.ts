/**
 * Error Logging Service
 * 
 * Centralized error logging for the application.
 * Can be extended to integrate with services like Sentry, LogRocket, or Datadog.
 */

interface ErrorContext {
  componentStack?: string;
  errorType?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  userEmail?: string;
  additionalData?: Record<string, any>;
}

interface ErrorLog {
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  sessionId: string;
}

class ErrorLogger {
  private sessionId: string;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 50;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger() {
    if (this.isInitialized) return;

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        errorType: 'unhandled',
        url: window.location.href,
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          errorType: 'unhandledRejection',
          url: window.location.href,
        }
      );
    });

    this.isInitialized = true;
  }

  /**
   * Log an error with context
   */
  logError(error: Error, context: ErrorContext = {}, severity: ErrorLog['severity'] = 'medium') {
    const errorLog: ErrorLog = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        userAgent: context.userAgent || navigator.userAgent,
        url: context.url || window.location.href,
      },
      severity,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    // Add to queue
    this.errorQueue.push(errorLog);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🔴 Error [${severity}]`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.log('Context:', context);
      console.groupEnd();
    }

    // Send to backend logging service
    this.sendToBackend(errorLog);

    // Store in localStorage for debugging
    this.persistErrorLog(errorLog);
  }

  /**
   * Log a network error
   */
  logNetworkError(url: string, status: number, statusText: string, context: ErrorContext = {}) {
    const error = new Error(`Network error: ${status} ${statusText} at ${url}`);
    this.logError(error, {
      ...context,
      errorType: 'network',
      additionalData: {
        url,
        status,
        statusText,
      },
    }, 'medium');
  }

  /**
   * Log an API error
   */
  logApiError(endpoint: string, method: string, error: any, context: ErrorContext = {}) {
    const apiError = error instanceof Error ? error : new Error(String(error));
    this.logError(apiError, {
      ...context,
      errorType: 'api',
      additionalData: {
        endpoint,
        method,
      },
    }, 'high');
  }

  /**
   * Log a user action error
   */
  logUserActionError(action: string, error: Error, context: ErrorContext = {}) {
    this.logError(error, {
      ...context,
      errorType: 'userAction',
      additionalData: {
        action,
      },
    }, 'low');
  }

  /**
   * Send error to backend logging service
   */
  private async sendToBackend(errorLog: ErrorLog) {
    try {
      // Only send in production to avoid noise
      if (!import.meta.env.PROD) return;

      // TODO: Replace with actual backend endpoint
      const response = await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        console.warn('Failed to send error log to backend');
      }
    } catch (err) {
      // Silently fail - don't want logging to break the app
      console.warn('Error sending log to backend:', err);
    }
  }

  /**
   * Persist error log to localStorage for debugging
   */
  private persistErrorLog(errorLog: ErrorLog) {
    try {
      const key = 'apartmentiq-error-logs';
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Keep only last 20 errors in localStorage
      const updatedLogs = [...existingLogs, errorLog].slice(-20);
      
      localStorage.setItem(key, JSON.stringify(updatedLogs));
    } catch (err) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to persist error log:', err);
    }
  }

  /**
   * Get all logged errors (for debugging or admin panel)
   */
  getErrorLogs(): ErrorLog[] {
    return [...this.errorQueue];
  }

  /**
   * Get persisted errors from localStorage
   */
  getPersistedErrors(): ErrorLog[] {
    try {
      const key = 'apartmentiq-error-logs';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear all error logs
   */
  clearErrorLogs() {
    this.errorQueue = [];
    try {
      localStorage.removeItem('apartmentiq-error-logs');
    } catch {
      // Silently fail
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, userEmail?: string) {
    // Store user context for future error logs
    // This would typically integrate with Sentry or similar service
    if (typeof window !== 'undefined') {
      (window as any).__errorLoggerUserContext = { userId, userEmail };
    }
  }

  /**
   * Add breadcrumb for debugging (sequence of events leading to error)
   */
  addBreadcrumb(message: string, data?: Record<string, any>) {
    if (import.meta.env.DEV) {
      console.log('🍞 Breadcrumb:', message, data);
    }
    // TODO: Implement breadcrumb tracking (e.g., with Sentry)
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (error: Error, context?: ErrorContext, severity?: ErrorLog['severity']) => {
  errorLogger.logError(error, context, severity);
};

export const logNetworkError = (url: string, status: number, statusText: string, context?: ErrorContext) => {
  errorLogger.logNetworkError(url, status, statusText, context);
};

export const logApiError = (endpoint: string, method: string, error: any, context?: ErrorContext) => {
  errorLogger.logApiError(endpoint, method, error, context);
};

export const logUserActionError = (action: string, error: Error, context?: ErrorContext) => {
  errorLogger.logUserActionError(action, error, context);
};

export const setUserContext = (userId: string, userEmail?: string) => {
  errorLogger.setUserContext(userId, userEmail);
};

export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  errorLogger.addBreadcrumb(message, data);
};

export const getErrorLogs = () => errorLogger.getErrorLogs();
export const getPersistedErrors = () => errorLogger.getPersistedErrors();
export const clearErrorLogs = () => errorLogger.clearErrorLogs();

export default errorLogger;
