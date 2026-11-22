import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Requires a logged-in user with the appropriate role.
 * Automatically routes users to their own area without destroying their session.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Checking authorization..." />;
  if (!user) {
    const loginTarget = role === 'admin' ? '/login/admin' : role === 'staff' ? '/login/staff' : '/login/citizen';
    return <Navigate to={loginTarget} replace state={{ from: location.pathname + location.search }} />;
  }

  // Cross-role safety redirects (Never forcibly logout on route mismatch)
  if (role === 'citizen' && user.role !== 'citizen') {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/staff'} replace />;
  }
  if (role === 'staff' && user.role !== 'staff') {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to={user.role === 'staff' ? '/staff' : '/dashboard'} replace />;
  }

  return children || <Outlet />;
}
