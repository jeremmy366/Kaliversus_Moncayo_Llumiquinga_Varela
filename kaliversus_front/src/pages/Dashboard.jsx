import React from "react";
import { useAuth } from "../context/AuthContext";
import AutorDashboard from "./dashboards/AutorDashboard";
import RevisorDashboard from "./dashboards/RevisorDashboard";
import EditorDashboard from "./dashboards/EditorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import MetricsPage from "./MetricsPage";
import LogsPage from "./LogsPage";
import LectorDashboard from "./dashboards/LectorDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  // Obtener el rol principal del usuario
  const getUserRole = () => {
    if (!user) return "LECTOR";
    // Soporta user.rol (string) y user.roles (array)
    let role = "LECTOR";
    if (user.rol && typeof user.rol === "string") {
      role = user.rol.replace("ROLE_", "").toUpperCase();
    } else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Soporta array de strings o de objetos
      let firstRole = user.roles[0];
      if (typeof firstRole === "string") {
        role = firstRole.replace("ROLE_", "").toUpperCase();
      } else if (typeof firstRole === "object" && firstRole !== null) {
        // Busca la propiedad más común
        const val = firstRole.nombre || firstRole.authority || firstRole.role || "";
        role = val.replace("ROLE_", "").toUpperCase();
      }
    }
    return role;
  };

  const userRole = getUserRole();
  console.log("[Dashboard] user:", user);
  console.log("[Dashboard] userRole:", userRole);

  // Renderizar dashboard específico según el rol
  const renderDashboard = () => {
    switch (userRole) {
      case "AUTOR":
        return <AutorDashboard />;
      case "REVISOR":
        return <RevisorDashboard />;
      case "EDITOR":
        return <EditorDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        return <LectorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 text-xs text-gray-400 text-right">
        <span>Rol actual: {user && (user.rol || (user.roles && user.roles.join(", ")) || "LECTOR")}</span>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
