import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function RequireBusinessAdmin({ children }) {
  const { businessId } = useParams();
  const { isSuperAdmin, isBusinessAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin() && !isBusinessAdmin(businessId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}





