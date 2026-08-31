import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);

  console.log('ProtectedRoute rendered');
  console.log('User:', user);
  console.log('AdminOnly:', adminOnly);
  console.log('User role:', user?.role);

  useEffect(() => {
    if (!user) {
      console.log('No user found, showing message and redirecting');
      setShowMessage(true);
      const timer = setTimeout(() => {
        // Redirect after showing message using router (respects basename)
        navigate('/login', { replace: true });
      }, 3000); // Show message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (!user) {
    console.log('User not authenticated');
    if (showMessage) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
          <div className="text-center p-8 border rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p>Please login to see this page.</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login page...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    console.log('User is not admin, showing access denied');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center p-8 border rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p>You do not have permission to view this page.</p>
          <p className="text-sm text-muted-foreground mt-2">Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  console.log('Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;