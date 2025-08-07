import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicationService } from "../../services/publicationService";
import reviewService from "../../services/reviewService";
import { Button } from "../../components/ui/Button";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [reply, setReply] = useState("");
  const [replyingId, setReplyingId] = useState(null);

  useEffect(() => {
    const fetchPub = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicationService.getPublicationById(id);
        setPub(data);
      } catch (err) {
        setError("No se pudo cargar la publicación");
      } finally {
        setLoading(false);
      }
    };
    fetchPub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewLoading(true);
    setReviewError(null);
    reviewService
      .getByPublication(id)
      .then((res) => {
        setReviews(Array.isArray(res.data) ? res.data : res.data?.reviews || []);
      })
      .catch(() => setReviewError("No se pudieron cargar las revisiones."))
      .finally(() => setReviewLoading(false));
  }, [id]);

  const handleReply = async (reviewId) => {
    setReplyingId(reviewId);
    try {
      await reviewService.update(reviewId, { comentarioAutor: reply });
      setReply("");
      // Refrescar revisiones
      const res = await reviewService.getByPublication(id);
      setReviews(Array.isArray(res.data) ? res.data : res.data?.reviews || []);
    } catch (e) {
      alert("Error al responder la revisión");
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-8">Cargando...</div>;
  if (error) return <div className="max-w-2xl mx-auto p-8 text-red-500">{error}</div>;
  if (!pub) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-2">{pub.titulo}</h2>
      <div className="mb-2 text-gray-600">Categoría: {pub.categoria}</div>
      <div className="mb-2 text-gray-600">Estado: {pub.estado}</div>
      <div className="mb-2 text-gray-600">Palabras clave: {pub.palabrasClave?.join(", ")}</div>
      <div className="mb-4 text-gray-800">{pub.resumen}</div>
      <div className="mb-8 whitespace-pre-line">{pub.contenido}</div>

      {/* Sección de revisiones */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Revisiones asociadas</h3>
        {reviewLoading ? (
          <div>Cargando revisiones...</div>
        ) : reviewError ? (
          <div className="text-red-500">{reviewError}</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No hay revisiones para esta publicación.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-2 text-sm text-gray-700">Revisor: {rev.revisorNombre || rev.revisorId || "-"}</div>
                <div className="mb-2 text-sm text-gray-700">Estado: {rev.estado}</div>
                <div className="mb-2 text-gray-800 whitespace-pre-line">{rev.comentario || "Sin comentarios del revisor."}</div>
                {/* Respuesta del autor */}
                {rev.comentarioAutor ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                    <span className="font-semibold">Tu respuesta:</span> {rev.comentarioAutor}
                  </div>
                ) : (
                  <div className="mt-2">
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      rows={2}
                      placeholder="Escribe tu respuesta o comentario al revisor..."
                      value={replyingId === rev.id ? reply : ""}
                      onChange={(e) => {
                        setReply(e.target.value);
                        setReplyingId(rev.id);
                      }}
                      disabled={replyingId && replyingId !== rev.id}
                    />
                    <Button size="sm" className="mt-2" loading={replyingId === rev.id} disabled={replyingId === rev.id && !reply.trim()} onClick={() => handleReply(rev.id)}>
                      Enviar respuesta
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-8">
        Volver
      </Button>
    </div>
  );
};

export default PublicationDetail;
