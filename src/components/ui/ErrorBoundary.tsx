import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { Card } from './Card';

// Error types for categorization
type ErrorCategory =
  | 'network'
  | 'validation'
  | 'permission'
  | 'system'
  | 'unknown';

// Error information interface
interface ErrorDetails {
  category: ErrorCategory;
  code?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalInfo?: Record<string, unknown>;
}

// Error boundary props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ErrorDetails, retry: () => void) => ReactNode;
  onError?: (error: ErrorDetails) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorDetails | null;
  errorId: string | null;
}

// Error categorization utility
const categorizeError = (error: Error): ErrorCategory => {
  const message = error.message.toLowerCase();

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout')
  ) {
    return 'network';
  }

  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return 'validation';
  }

  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return 'permission';
  }

  if (
    message.includes('system') ||
    message.includes('internal') ||
    message.includes('server')
  ) {
    return 'system';
  }

  return 'unknown';
};

// Generate error ID for tracking
const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Enhanced Error Boundary Component
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = generateErrorId();

    const userId = localStorage.getItem('userId');
    const sessionId = sessionStorage.getItem('sessionId');

    const errorDetails: ErrorDetails = {
      category: categorizeError(error),
      message: error.message,
      ...(error.stack && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
    };

    return {
      hasError: true,
      error: errorDetails,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.state.error) {
      const enhancedError: ErrorDetails = {
        ...this.state.error,
        ...(errorInfo.componentStack && {
          componentStack: errorInfo.componentStack,
        }),
        additionalInfo: {
          reactVersion: React.version,
          timestamp: new Date().toISOString(),
          errorInfo,
        },
      };

      // Log error for debugging
      console.group(`🚨 Error Boundary - ${this.state.errorId}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Enhanced Error Details:', enhancedError);
      console.groupEnd();

      // Call onError callback if provided
      if (this.props.onError) {
        this.props.onError(enhancedError);
      }

      // Report error to external service (e.g., Sentry, LogRocket)
      this.reportError(enhancedError);

      // Update state with enhanced error
      this.setState({
        error: enhancedError,
      });
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = async (error: ErrorDetails) => {
    try {
      // In a real application, you would send this to your error reporting service
      // Example: Sentry.captureException(error)

      if (import.meta.env.PROD) {
        // Only report in production
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error),
        });
      }
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorActions = () => {
    const { level = 'component' } = this.props;

    return (
      <div className='flex flex-col sm:flex-row gap-3 mt-6'>
        <Button
          onClick={this.handleRetry}
          className='flex items-center gap-2'
          variant='primary'
        >
          <RefreshCw className='w-4 h-4' />
          Try Again
        </Button>

        {level !== 'component' && (
          <Button
            onClick={this.handleRefresh}
            variant='secondary'
            className='flex items-center gap-2'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh Page
          </Button>
        )}

        {level === 'critical' && (
          <Button
            onClick={this.handleGoHome}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Home className='w-4 h-4' />
            Go Home
          </Button>
        )}
      </div>
    );
  };

  private renderErrorDetails = () => {
    if (!this.props.showDetails || !this.state.error) return null;

    return (
      <details className='mt-4'>
        <summary className='cursor-pointer text-body-small font-medium text-muted-foreground hover:text-foreground'>
          Technical Details
        </summary>
        <div className='mt-2 p-3 bg-muted rounded border text-caption font-mono text-muted-foreground'>
          <div>
            <strong>Error ID:</strong> {this.state.errorId}
          </div>
          <div>
            <strong>Category:</strong> {this.state.error.category}
          </div>
          <div>
            <strong>Timestamp:</strong> {this.state.error.timestamp}
          </div>
          {this.state.error.code && (
            <div>
              <strong>Code:</strong> {this.state.error.code}
            </div>
          )}
          <div>
            <strong>Message:</strong> {this.state.error.message}
          </div>
          {this.state.error.stack && (
            <details className='mt-2'>
              <summary className='cursor-pointer'>Stack Trace</summary>
              <pre className='mt-1 whitespace-pre-wrap text-caption'>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      </details>
    );
  };

  private getErrorTitle = (): string => {
    if (!this.state.error) return 'Something went wrong';

    switch (this.state.error.category) {
      case 'network':
        return 'Connection Problem';
      case 'validation':
        return 'Validation Error';
      case 'permission':
        return 'Access Denied';
      case 'system':
        return 'System Error';
      default:
        return 'Something went wrong';
    }
  };

  private getErrorDescription = (): string => {
    if (!this.state.error) return 'An unexpected error occurred.';

    switch (this.state.error.category) {
      case 'network':
        return 'There seems to be a problem with your internet connection or our servers are temporarily unavailable.';
      case 'validation':
        return 'The information provided is invalid or incomplete. Please check your input and try again.';
      case 'permission':
        return 'You do not have permission to access this resource. Please contact your administrator.';
      case 'system':
        return 'A system error occurred. Our team has been notified and is working to resolve the issue.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-muted'>
          <Card className='max-w-lg w-full p-6 text-center'>
            <div className='flex justify-center mb-4'>
              <div className='p-3 bg-destructive/10 rounded-full'>
                <AlertTriangle className='w-8 h-8 text-destructive' />
              </div>
            </div>

            <h1 className='text-h2 font-semibold text-foreground mb-2'>
              {this.getErrorTitle()}
            </h1>

            <p className='text-muted-foreground mb-4'>
              {this.getErrorDescription()}
            </p>

            {this.state.errorId && (
              <p className='text-caption text-muted-foreground mb-4'>
                Error ID: {this.state.errorId}
              </p>
            )}

            {this.renderErrorActions()}
            {this.renderErrorDetails()}

            {import.meta.env.DEV && (
              <div className='mt-4 p-3 bg-warning/10 border border-warning/30 rounded text-left'>
                <div className='flex items-center gap-2 text-warning font-medium mb-2'>
                  <Bug className='w-4 h-4' />
                  Development Info
                </div>
                <pre className='text-caption text-warning whitespace-pre-wrap'>
                  {this.state.error?.message}
                </pre>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook for triggering error boundary from components
export const useErrorHandler = () => {
  const [, setState] = React.useState();

  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
};

export default ErrorBoundary;
