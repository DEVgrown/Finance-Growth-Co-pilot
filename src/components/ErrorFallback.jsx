import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * Enhanced error fallback component with better UX
 */
export default function ErrorFallback({ error, resetErrorBoundary }) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-red-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Oops! Something went wrong
          </CardTitle>
          <p className="text-gray-600 mt-2">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDevelopment && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-800 mb-2">Error Details (Development Only):</p>
              <pre className="text-xs text-red-700 overflow-auto max-h-40 custom-scrollbar">
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-800 mb-2">What you can do:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>If the problem persists, contact support</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            Error ID: {Date.now().toString(36)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Inline error display for smaller components
 */
export function InlineError({ error, retry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-sm text-red-700 mt-1">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {retry && (
            <Button
              onClick={retry}
              size="sm"
              variant="outline"
              className="mt-3 border-red-600 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Network error component
 */
export function NetworkError({ retry }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-yellow-600" />
      </div>
      <h3 className="font-semibold text-yellow-900 mb-2">Connection Issue</h3>
      <p className="text-sm text-yellow-700 mb-4">
        Unable to connect to the server. Please check your internet connection.
      </p>
      {retry && (
        <Button
          onClick={retry}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      {action && actionLabel && (
        <Button onClick={action} className="bg-blue-600 hover:bg-blue-700 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
