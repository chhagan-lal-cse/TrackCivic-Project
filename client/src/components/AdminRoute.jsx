import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/** Restricts a route tree to administrators. */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Checking authorization..." />;
  if (!user) return <Navigate to="/login/admin" replace state={{ from: location.pathname }} />;

  // Non-admins are redirected safely to their respective home dashboard without logging out
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  if (user.role === 'citizen') return <Navigate to="/dashboard" replace />;
  if (user.role !== 'admin') return <Navigate to="/login/admin" replace state={{ wrongRole: true }} />;

  return children || <Outlet />;
}
