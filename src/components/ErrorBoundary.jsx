import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();
  
  console.error('ErrorBoundary caught error:', error);

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = null;
  let errorDetails = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
    
    // Provide helpful messages for common HTTP errors
    if (errorStatus === 404) {
      errorMessage = 'Page not found';
      errorDetails = 'The page you are looking for does not exist or has been moved.';
    } else if (errorStatus === 403) {
      errorMessage = 'Access denied';
      errorDetails = 'You do not have permission to access this page.';
    } else if (errorStatus === 500) {
      errorMessage = 'Server error';
      errorDetails = 'Something went wrong on our end. Please try again later.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = import.meta.env.DEV ? error.stack : null;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const errorId = Date.now().toString(36);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-2xl w-full p-8 rounded-lg bg-white shadow-2xl border border-red-200">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorStatus ? `Error ${errorStatus}` : 'Oops! Something went wrong'}
          </h1>
          <p className="text-lg text-gray-600">
            {errorMessage}
          </p>
          {errorDetails && (
            <p className="text-sm text-gray-500 mt-2">
              {errorDetails}
            </p>
          )}
        </div>

        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800 mb-2 text-sm">
              Error Stack (Development Only):
            </p>
            <pre className="text-xs text-red-700 overflow-auto max-h-40 custom-scrollbar">
              {error.stack}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-blue-800 mb-2 text-sm">What you can do:</p>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>Try refreshing the page</li>
            <li>Go back to the previous page</li>
            <li>Return to the dashboard</li>
            <li>Clear your browser cache if the problem persists</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors tap-target"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors tap-target"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <Link 
            to="/" 
            className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors tap-target"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Error ID: {errorId} • Report this if the problem persists
        </p>
      </div>
    </div>
  );
}