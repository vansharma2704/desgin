import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'var(--background)', color: 'var(--text-1)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading AI Brand Studio...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user role is not allowed on this path, redirect to their home dashboard
    if (user.role === 'Reviewer') {
      return <Navigate to="/reviewer/dashboard" replace />;
    } else {
      return <Navigate to="/editor/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
