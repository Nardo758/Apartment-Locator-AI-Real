/**
 * ErrorBoundary Test Suite
 * 
 * Tests for error boundary functionality and different error scenarios
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

// Component that works normally
const NormalComponent = () => <div>Normal content</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders network error page for network errors', () => {
    const networkError = new Error('Failed to fetch');
    
    render(
      <ErrorBoundary>
        <ThrowError error={networkError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    expect(screen.getByText(/trouble connecting to our servers/i)).toBeInTheDocument();
  });

  it('renders auth error page for 403 errors', () => {
    const authError = new Error('Forbidden - 403');
    
    render(
      <ErrorBoundary>
        <ThrowError error={authError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
  });

  it('renders server error page for 500 errors', () => {
    const serverError = new Error('Internal Server Error 500');
    
    render(
      <ErrorBoundary>
        <ThrowError error={serverError} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Server Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong on our end/i)).toBeInTheDocument();
  });

  it('renders client error page for generic errors', () => {
    const genericError = new Error('Something went wrong');
    
    render(
      <ErrorBoundary>
        <ThrowError error={genericError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    const error = new Error('Test error');
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

/**
 * Manual Testing Scenarios
 * 
 * Use these in the browser console to test error boundaries:
 * 
 * 1. Network Error:
 *    - Disconnect internet and try to fetch data
 *    - Or in console: throw new Error('Failed to fetch')
 * 
 * 2. Auth Error:
 *    - Navigate to protected route without authentication
 *    - Or in console: throw new Error('Forbidden - 403')
 * 
 * 3. Server Error:
 *    - Trigger a backend error (return 500 from API)
 *    - Or in console: throw new Error('Internal Server Error 500')
 * 
 * 4. Generic Client Error:
 *    - Call a method on undefined
 *    - Or in console: throw new Error('Generic error')
 * 
 * 5. Test Error Logger:
 *    - Check localStorage: localStorage.getItem('apartmentiq-error-logs')
 *    - View error queue in console
 */
