import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { apiClient } from "@/lib/apiClient";

export default function RoleBasedRedirect({ children }) {
  const navigate = useNavigate();
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        return await apiClient.getUserProfile();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user
  });

  useEffect(() => {
    // Only redirect if we have user and profile data
    if (user && userProfile) {
      const role = userProfile.role || 'owner';
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on the correct dashboard
      if (currentPath === '/' || currentPath === '/dashboard') {
        if (role === 'admin' && currentPath !== '/admin-dashboard') {
          navigate('/admin-dashboard', { replace: true });
        } else if (role === 'data_entry' && currentPath !== '/data-entry-dashboard') {
          navigate('/data-entry-dashboard', { replace: true });
        } else if (role === 'owner' && currentPath !== '/dashboard') {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, userProfile, navigate]);

  return children;
}
