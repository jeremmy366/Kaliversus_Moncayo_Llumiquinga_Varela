import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const MetricsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Métricas del Sistema</h1>
        <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          Volver al Dashboard
        </Button>
      </div>
      <p className="mb-4">
        Aquí puedes consultar las métricas técnicas expuestas por el backend (Prometheus, uso de recursos, etc). Si tienes habilitado el endpoint <code>/metrics</code> en tu
        backend, puedes verlo a continuación:
      </p>
      <iframe src="/metrics" title="Métricas" className="w-full h-[500px] border rounded bg-white" style={{ minHeight: 400 }} />
      <p className="mt-4 text-gray-500 text-sm">
        Si no ves datos, asegúrate de que el endpoint <code>/metrics</code> esté habilitado y accesible.
      </p>
    </div>
  );
};

export default MetricsPage;
