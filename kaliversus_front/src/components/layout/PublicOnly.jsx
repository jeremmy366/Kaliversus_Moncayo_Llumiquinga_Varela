import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicOnly = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // O un loader
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default PublicOnly;
