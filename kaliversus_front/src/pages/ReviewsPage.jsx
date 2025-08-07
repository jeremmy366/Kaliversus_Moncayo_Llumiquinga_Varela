import React, { useEffect, useState } from "react";
import reviewService from "../services/reviewService";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    reviewService
      .getAll()
      .then((res) => {
        // Asegura que reviews sea siempre un array
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.reviews) ? res.data.reviews : [];
        setReviews(data);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar las revisiones."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestión de Revisiones (Peer Review)</h1>
        <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          Volver al Dashboard
        </Button>
      </div>
      <p className="text-gray-600 mb-6">Aquí podrás gestionar las revisiones de publicaciones. (Solo editores/admins)</p>
      {loading ? (
        <p>Cargando revisiones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p>No hay revisiones registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Publicación</th>
                <th className="px-4 py-2 border">Estado</th>
                <th className="px-4 py-2 border">Revisor</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 border">{r.id}</td>
                  <td className="px-4 py-2 border">{r.publicacionTitulo || r.publicacionId || "-"}</td>
                  <td className="px-4 py-2 border">{r.estado || "-"}</td>
                  <td className="px-4 py-2 border">{r.revisorNombre || r.revisorId || "-"}</td>
                  <td className="px-4 py-2 border">
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
