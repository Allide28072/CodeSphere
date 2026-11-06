import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './Loader';

export default function ProtectedRoute({ children }) {
  const { loading, session, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader label="Checking access" />;

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
