import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("adminToken");

  // Se il token esiste, permetti l'accesso ai componenti figli (Outlet)
  // Altrimenti, reindirizza alla pagina di login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;