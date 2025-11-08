import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "@/pages/Login";
import { useAuth } from "../contexts/AuthContext";

export default function RootRedirect() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) return; // show login

    if (auth.isSuperAdmin()) {
      navigate('/super-admin', { replace: true });
      return;
    }
    const businesses = auth.getBusinesses();
    const adminBiz = businesses.find(b => b.role === 'business_admin');
    if (adminBiz) {
      navigate(`/business/${adminBiz.id}/dashboard`, { replace: true });
      return;
    }
    navigate('/dashboard', { replace: true });
  }, [auth.loading, auth.isAuthenticated, navigate]);

  return <Login />;
}

