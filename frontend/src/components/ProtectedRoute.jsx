import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireEditor = false }) => {
  const { isAuthenticated, loading, isEditor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireEditor && !isEditor) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
