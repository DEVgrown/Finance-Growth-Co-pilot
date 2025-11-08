import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - cache for 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
      // Use localStorage for caching
      cacheTime: 30 * 60 * 1000,
    },
  },
});

// Simple localStorage cache helper
if (typeof window !== 'undefined') {
  // Restore cache on mount
  const cacheKey = 'REACT_QUERY_CACHE';
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const timestamp = parsed.timestamp || 0;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (Date.now() - timestamp < maxAge) {
        // Cache is still valid, restore it
        queryClient.setQueryData(['cached'], parsed.data);
      } else {
        // Cache expired, clear it
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      // Invalid cache, clear it
      localStorage.removeItem(cacheKey);
    }
  }
  
  // Save cache periodically (disabled to avoid circular structure errors)
  // Query cache is managed by React Query internally
  // setInterval(() => {
  //   const cacheData = {
  //     timestamp: Date.now(),
  //     data: queryClient.getQueryCache().getAll(),
  //   };
  //   localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  // }, 5 * 60 * 1000); // Save every 5 minutes
}