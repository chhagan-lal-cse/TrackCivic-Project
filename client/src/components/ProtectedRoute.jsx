import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Requires a logged-in user. With role="citizen", administrators are sent to the admin area.
 * (UX only: the API enforces every permission independently.)
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (role === 'citizen' && !loading && user && user.role !== 'citizen') {
      setClearing(true);
      logout({ redirect: false }).finally(() => setClearing(false));
    }
  }, [role, loading, user, logout]);

  if (loading || clearing) return <LoadingSpinner fullPage label="Checking your session" />;
  if (!user) return <Navigate to="/login/citizen" replace state={{ from: location.pathname + location.search }} />;
  if (role === 'citizen' && user.role !== 'citizen') {
    return <Navigate to="/login/citizen" replace state={{ wrongRole: true }} />;
  }
  if (role === 'staff' && user.role !== 'staff') {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children || <Outlet />;
}
