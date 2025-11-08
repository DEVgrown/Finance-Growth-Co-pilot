import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component with different sizes and variants
 */
export default function LoadingSpinner({ 
  size = 'md', 
  text = '', 
  fullScreen = false,
  variant = 'primary' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[variant]} animate-spin`} 
      />
      {text && (
        <p className={`text-sm ${variant === 'white' ? 'text-white' : 'text-gray-600'} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Loading skeleton for cards and content
 */
export function LoadingSkeleton({ className = '', lines = 3 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Loading card skeleton
 */
export function LoadingCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <LoadingSkeleton lines={3} />
        </div>
      ))}
    </>
  );
}

/**
 * Loading table skeleton
 */
export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-gray-200 rounded flex-1 animate-pulse"
                style={{ animationDelay: `${colIndex * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
