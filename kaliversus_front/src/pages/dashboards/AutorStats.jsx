import React, { useEffect, useState } from "react";
import { publicationService } from "../../services/publicationService";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";

const AutorStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const pubs = await publicationService.getMyPublications();
        const publicaciones = pubs.publications || [];
        const total = publicaciones.length;
        const porEstado = publicaciones.reduce((acc, pub) => {
          acc[pub.estado] = (acc[pub.estado] || 0) + 1;
          return acc;
        }, {});
        const palabrasClave = publicaciones.flatMap((p) => p.palabrasClave || []);
        const palabrasFrecuentes = palabrasClave.reduce((acc, palabra) => {
          acc[palabra] = (acc[palabra] || 0) + 1;
          return acc;
        }, {});
        setStats({ total, porEstado, palabrasFrecuentes });
      } catch (e) {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto p-8">Cargando estadísticas...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-8 text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Estadísticas de tus publicaciones</h2>
      <div className="mb-4">
        Total de publicaciones: <span className="font-bold">{stats.total}</span>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Por estado:</h3>
        <ul className="list-disc ml-6">
          {Object.entries(stats.porEstado).map(([estado, count]) => (
            <li key={estado}>
              {estado.replace("_", " ")}: <span className="font-bold">{count}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Palabras clave más usadas:</h3>
        <ul className="list-disc ml-6">
          {Object.entries(stats.palabrasFrecuentes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([palabra, count]) => (
              <li key={palabra}>
                {palabra}: <span className="font-bold">{count}</span>
              </li>
            ))}
        </ul>
      </div>
      <Button variant="outline" onClick={() => window.history.back()}>
        Volver
      </Button>
    </div>
  );
};

export default AutorStats;
