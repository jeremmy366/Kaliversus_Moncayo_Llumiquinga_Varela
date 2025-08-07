import React, { useEffect, useState } from "react";
import systemService from "../services/systemService";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    systemService
      .getActivity(50)
      .then((data) => setLogs(data))
      .catch(() => setError("No se pudieron cargar los logs."))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Logs del Sistema</h1>
        <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          Volver al Dashboard
        </Button>
      </div>
      {loading ? (
        <p>Cargando logs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : logs.length === 0 ? (
        <p>No hay logs recientes.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{log.type}</span>
                <span className="text-xs text-gray-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}</span>
              </div>
              <div className="text-sm">{log.message}</div>
              {log.userId && <div className="text-xs text-gray-400 mt-1">Usuario: {log.userId}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogsPage;
