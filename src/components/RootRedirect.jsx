import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { apiClient } from "@/lib/apiClient";
import Login from "@/pages/Login";

export default function RootRedirect() {
  const navigate = useNavigate();
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        return await apiClient.getUserProfile();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user,
    retry: false
  });

  useEffect(() => {
    // If user is authenticated and we have profile data, redirect to appropriate dashboard
    if (user && userProfile && !isLoadingUser && !isLoadingProfile) {
      const role = userProfile.role || 'owner';
      
      if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === 'data_entry') {
        navigate('/data-entry-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, isLoadingUser, isLoadingProfile, navigate]);

  // Show login page while checking authentication or if not authenticated
  return <Login />;
}

