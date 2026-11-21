import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/** Restricts a route tree to administrators. The API enforces this independently. */
export default function AdminRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      setClearing(true);
      logout({ redirect: false }).finally(() => setClearing(false));
    }
  }, [loading, user, logout]);

  if (loading || clearing) return <LoadingSpinner fullPage label="Checking your session" />;
  if (!user) return <Navigate to="/login/admin" replace state={{ from: location.pathname }} />;
  if (user.role !== 'admin') return <Navigate to="/login/admin" replace state={{ wrongRole: true }} />;
  return children || <Outlet />;
}
