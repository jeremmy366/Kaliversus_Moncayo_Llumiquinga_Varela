import React, { useState, useEffect } from "react";
import systemService from "../../services/systemService";
import statsService from "../../services/statsService";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [systemStats, setSystemStats] = useState({
    totalUsuarios: 0,
    publicacionesTotales: 0,
    usuariosActivos: 0, // Si tu API lo soporta, puedes actualizarlo
    revisoresTotales: 0, // Si tu API lo soporta, puedes actualizarlo
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const stats = await statsService.getSystemStats();
        setSystemStats((prev) => ({ ...prev, ...stats }));
      } catch (e) {
        // Puedes mostrar un error si lo deseas
      }
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // Estado del sistema
    setHealthLoading(true);
    systemService
      .getHealth()
      .then((data) => setSystemHealth(data))
      .catch(() => setSystemHealth(null))
      .finally(() => setHealthLoading(false));
    // Actividad reciente
    setActivityLoading(true);
    systemService
      .getActivity(10)
      .then((data) => setRecentActivity(data))
      .catch(() => setRecentActivity([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const getHealthColor = (status) => {
    const colors = {
      OK: "text-green-600 bg-green-100",
      WARNING: "text-yellow-600 bg-yellow-100",
      ERROR: "text-red-600 bg-red-100",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      info: "text-blue-600 bg-blue-50 border-blue-200",
      success: "text-green-600 bg-green-50 border-green-200",
      warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
      error: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[severity] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "error":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "success":
        return <ShieldCheckIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard del Administrador</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombres} {user?.apellidos} - Control total del sistema
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? "..." : systemStats.totalUsuarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publicaciones</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? "..." : systemStats.publicacionesTotales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revisores</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.revisoresTotales !== undefined ? systemStats.revisoresTotales : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Herramientas de Administración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-start items-center">
              <Link to="/admin/users" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <UsersIcon className="h-5 w-5" />
                  <span>Gestionar Usuarios</span>
                </Button>
              </Link>
              <Link to="/admin/publications" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Gestionar Publicaciones</span>
                </Button>
              </Link>
              <Link to="/admin/reviews" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span>Revisiones</span>
                </Button>
              </Link>
              <Link to="/notificaciones" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <EnvelopeIcon className="h-5 w-5" />
                  <span>Notificaciones</span>
                </Button>
              </Link>
              <Link to="/configuracion" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <CogIcon className="h-5 w-5" />
                  <span>Configuración</span>
                </Button>
              </Link>
              <Link to="/admin/metrics" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Métricas</span>
                </Button>
              </Link>
              <Link to="/admin/logs" className="">
                <Button className="flex items-center gap-2 px-6 py-3 font-semibold text-base bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <ServerIcon className="h-5 w-5" />
                  <span>Logs del Sistema</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ServerIcon className="h-5 w-5" />
              <span>Estado del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="text-gray-500">Cargando estado del sistema...</div>
            ) : !systemHealth ? (
              <div className="text-red-500">No se pudo obtener el estado del sistema.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(systemHealth)
                  .filter(([key, value]) => value && typeof value === "object" && "status" in value)
                  .map(([service, health]) => (
                    <div key={service} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            health.status === "ok" || health.status === "OK"
                              ? "bg-green-500"
                              : health.status === "warning" || health.status === "WARNING"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="font-medium capitalize">{service.replace(/([A-Z])/g, " $1")}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                            health.status?.toUpperCase?.() || health.status
                          )}`}
                        >
                          {health.status}
                        </span>
                        {health.responseTime && <p className="text-xs text-gray-500 mt-1">{health.responseTime}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-gray-500">Cargando actividad...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-gray-500">No hay actividad reciente.</div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`border rounded-lg p-4 ${getSeverityColor(activity.severity)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getSeverityIcon(activity.severity)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ""}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Ver Todos los Eventos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
