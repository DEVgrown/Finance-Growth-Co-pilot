import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { isSuperAdmin } = useAuth();

  console.log('🔵 AdminLayout RENDERING - This should show dark sidebar');

  // Get pending registrations count for badge
  const { data: pendingRegistrations = [] } = useQuery({
    queryKey: ['pending-registrations-count'],
    queryFn: async () => {
      return await apiClient.listPendingRegistrations();
    },
    enabled: isSuperAdmin(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000 // Consider data stale after 20 seconds
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar pendingCount={pendingRegistrations?.length || 0} />
      
      {/* Main Content - offset by sidebar width */}
      <div className="flex-1 ml-64 transition-all duration-300 overflow-auto relative z-0 bg-white">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
