import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../pages/user-management/auth/AuthPages.css';

const GuestRoute = ({ children }) => {
  const { authReady, isAuthenticated, user } = useAuth();

  if (!authReady) {
    return (
      <div className="route-loader">
        <div className="route-loader__spinner" />
        <p>Preparing the page...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dev/hotels' : '/'} replace />;
  }

  return children;
};

export default GuestRoute;
