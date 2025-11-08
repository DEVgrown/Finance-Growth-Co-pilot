import React from 'react';
import { Loader2 } from 'lucide-react';

export function AnimatedLoader({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export function InlineLoader({ className = '' }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${className}`} />
  );
}


