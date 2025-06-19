import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, token } = useAuth();

  // If no user or token, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;