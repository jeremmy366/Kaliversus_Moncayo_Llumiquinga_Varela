import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // O un loader
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default RequireAuth;
