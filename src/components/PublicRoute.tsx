import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, token } = useAuth();

  // If already authenticated, redirect to dashboard
  if (user && token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public component
  return <>{children}</>;
};

export default PublicRoute;