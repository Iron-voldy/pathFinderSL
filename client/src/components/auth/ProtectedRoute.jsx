import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../pages/user-management/auth/AuthPages.css';

const ProtectedRoute = ({ children, role = null }) => {
  const location = useLocation();
  const { authReady, isAuthenticated, user } = useAuth();

  if (!authReady) {
    return (
      <div className="route-loader">
        <div className="route-loader__spinner" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = role === 'admin' ? '/adminlogin' : '/userlogin';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dev/hotels' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
