import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  
  console.error('ErrorBoundary caught error:', error);

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 rounded-lg bg-white shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h1>
        {errorStatus && (
          <p className="text-sm text-gray-500 mb-2">
            Status: {errorStatus}
          </p>
        )}
        <p className="text-gray-700 mb-6">
          {errorMessage}
        </p>
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}