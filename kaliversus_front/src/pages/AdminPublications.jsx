import React, { useEffect, useState } from "react";
import { publicationService } from "../services/publicationService";
import reviewService from "../services/reviewService";
import { Button } from "../components/ui/Button";
import notificationService from "../services/notificationService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminPublications = () => {
  const { user } = useAuth();
  console.log("[AdminPublications] user:", user);
  const [publications, setPublications] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, pubId: null });
  const [viewModal, setViewModal] = useState({ open: false, pub: null });
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState("PENDIENTE");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [pubReviews, setPubReviews] = useState({}); // { [pubId]: [reviews] }
  const [actionLoading, setActionLoading] = useState(false);
  // Email notification modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ to: "", subject: "", message: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);
  // Email send handler
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailSuccess(null);
    setEmailError(null);
    try {
      await notificationService.sendEmail(emailData);
      setEmailSuccess("¡Correo enviado correctamente!");
      setEmailData({ to: "", subject: "", message: "" });
      setShowEmailModal(false);
    } catch (err) {
      setEmailError("Error al enviar el correo.");
    }
    setSendingEmail(false);
  };

  useEffect(() => {
    setLoading(true);
    publicationService
      .getPublications({ page, limit })
      .then(async (res) => {
        const pubs = res.items || res.publications || res;
        setPublications(pubs);
        setTotal(res.total || 0);
        // Cargar reviews para publicaciones en revisión
        const reviewMap = {};
        await Promise.all(
          pubs.map(async (p) => {
            if (p.estado === "EN_REVISION") {
              try {
                const r = await reviewService.getByPublication(p.id);
                reviewMap[p.id] = Array.isArray(r.data) ? r.data : r.data?.reviews || [];
              } catch {
                reviewMap[p.id] = [];
              }
            }
          })
        );
        setPubReviews(reviewMap);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar publicaciones");
        setLoading(false);
      });
  }, [page, limit]);
  const handleCreateReview = async (pubId) => {
    setReviewLoading(true);
    try {
      // Forzar todos los campos a string y loguear el body
      const body = {
        publicacionId: String(pubId),
        revisorId: String(user?.id),
        comentarios: String(reviewText),
        estado: String(reviewStatus),
        historialCambios: {
          assignedBy: String(user?.id),
          assignedAt: new Date().toISOString(),
        },
      };
      console.log("Enviando review:", body);
      await reviewService.create(body);
      setReviewModal({ open: false, pubId: null });
      setReviewText("");
      setReviewStatus("PENDIENTE");
      // Refrescar reviews para esa publicación
      const r = await reviewService.getByPublication(pubId);
      setPubReviews((prev) => ({ ...prev, [pubId]: Array.isArray(r.data) ? r.data : r.data?.reviews || [] }));
    } catch (err) {
      if (err?.response?.data) {
        alert("Error al crear revisión: " + JSON.stringify(err.response.data));
        console.error("Error backend:", err.response.data);
      } else {
        alert("Error al crear revisión");
      }
    }
    setReviewLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;
    setActionLoading(true);
    try {
      await publicationService.deletePublication(id);
      setPublications(publications.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar publicación");
    }
    setActionLoading(false);
  };

  const handlePublish = async (id) => {
    setActionLoading(true);
    try {
      await publicationService.changePublicationStatus(id, "PUBLICADO");
      setPublications(publications.map((p) => (p.id === id ? { ...p, estado: "PUBLICADO" } : p)));
    } catch {
      alert("Error al publicar artículo");
    }
    setActionLoading(false);
  };

  // Filtrado por búsqueda
  const filteredPublications = publications.filter((p) => p.titulo?.toLowerCase().includes(search.toLowerCase()) || p.estado?.toLowerCase().includes(search.toLowerCase()));

  // Sección 1: Publicaciones del Administrador (BORRADOR y autorPrincipalId === user.id)
  const adminDrafts = filteredPublications.filter((p) => p.estado === "BORRADOR" && p.autorPrincipalId === user?.id);

  // Sección 2: Publicaciones a Revisar (todas menos las anteriores)
  const toReview = filteredPublications.filter((p) => !(p.estado === "BORRADOR" && p.autorPrincipalId === user?.id));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="mb-2 text-xs text-gray-500">user.role: {user?.role}</div>
        <h2 className="text-2xl font-bold">Gestión de Publicaciones</h2>
        <div className="flex gap-2">
          {user?.role && ["ADMIN", "AUTOR"].includes(user.role.toUpperCase()) && (
            <Button size="sm" variant="outline" onClick={() => setShowEmailModal(true)}>
              Enviar Notificación
            </Button>
          )}
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Volver al Dashboard
          </button>
        </div>
      </div>
      {/* Modal para enviar correo */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
            <span onClick={() => setShowEmailModal(false)} className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold">
              &times;
            </span>
            <h2 className="text-lg font-bold mb-2">Enviar correo/Notificación</h2>
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Correo destino</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asunto</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea
                  required
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={sendingEmail}>
                  {sendingEmail ? "Enviando..." : "Enviar"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowEmailModal(false)}>
                  Cancelar
                </Button>
                {emailError && <span className="text-red-500 text-sm ml-2">{emailError}</span>}
                {emailSuccess && <span className="text-green-600 text-sm ml-2">{emailSuccess}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
      <input
        type="text"
        placeholder="Buscar por título o estado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Sección: Publicaciones del Administrador */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Tus publicaciones en borrador</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Título</th>
                    <th className="px-4 py-2 border">Estado</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {adminDrafts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        No tienes publicaciones en borrador.
                      </td>
                    </tr>
                  ) : (
                    adminDrafts.map((pub) => (
                      <tr key={pub.id}>
                        <td className="border px-4 py-2">{pub.titulo}</td>
                        <td className="border px-4 py-2">{pub.estado}</td>
                        <td className="border px-4 py-2 space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              let pubFull = pub;
                              if (!pub.contenido || !pub.resumen) {
                                try {
                                  pubFull = await publicationService.getPublicationById(pub.id);
                                } catch {}
                              }
                              setViewModal({ open: true, pub: pubFull });
                            }}
                          >
                            Ver completo
                          </Button>
                          <Button size="sm" variant="success" onClick={() => navigate(`/publications/${pub.id}/edit`)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(pub.id)} disabled={actionLoading}>
                            Eliminar
                          </Button>
                          <Button size="sm" variant="success" onClick={() => handleChangeStatus(pub.id, "EN_REVISION")} disabled={actionLoading}>
                            Enviar a revisión
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección: Publicaciones a Revisar */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Publicaciones a revisar</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Título</th>
                    <th className="px-4 py-2 border">Estado</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {toReview.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        No hay publicaciones para revisar.
                      </td>
                    </tr>
                  ) : (
                    toReview.map((pub) => (
                      <tr key={pub.id}>
                        <td className="border px-4 py-2">{pub.titulo}</td>
                        <td className="border px-4 py-2">{pub.estado}</td>
                        <td className="border px-4 py-2 space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              let pubFull = pub;
                              if (!pub.contenido || !pub.resumen) {
                                try {
                                  pubFull = await publicationService.getPublicationById(pub.id);
                                } catch {}
                              }
                              setViewModal({ open: true, pub: pubFull });
                            }}
                          >
                            Ver completo
                          </Button>
                          {/* Acciones según el estado */}
                          {pub.estado === "EN_REVISION" ? (
                            pubReviews[pub.id] && pubReviews[pub.id].length > 0 ? (
                              <>
                                <Button size="sm" variant="success" onClick={() => handleChangeStatus(pub.id, "APROBADO")} disabled={actionLoading}>
                                  Aceptar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleChangeStatus(pub.id, "CAMBIOS_SOLICITADOS")} disabled={actionLoading}>
                                  Solicitar cambios
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleChangeStatus(pub.id, "RETIRADO")} disabled={actionLoading}>
                                  Rechazar
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setReviewModal({ open: true, pubId: pub.id })}>
                                Crear revisión
                              </Button>
                            )
                          ) : (user?.role === "ADMIN" && pub.estado !== "PUBLICADO") ||
                            (user?.role !== "ADMIN" && pub.estado === "APROBADO" && pub.autorPrincipalId === user?.id) ? (
                            <Button size="sm" variant="success" onClick={() => handleChangeStatus(pub.id, "PUBLICADO")} disabled={actionLoading}>
                              Publicar
                            </Button>
                          ) : (
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(pub.id)} disabled={actionLoading}>
                              Eliminar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal para ver detalles completos de la publicación */}
          {viewModal.open && viewModal.pub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                <span
                  onClick={() => setViewModal({ open: false, pub: null })}
                  className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </span>
                <h2 className="text-2xl font-bold mb-2">{viewModal.pub.titulo}</h2>
                <div className="mb-2 text-gray-600">Categoría: {viewModal.pub.categoria}</div>
                <div className="mb-2 text-gray-600">Estado: {viewModal.pub.estado}</div>
                <div className="mb-2 text-gray-600">
                  Palabras clave: {Array.isArray(viewModal.pub.palabrasClave) ? viewModal.pub.palabrasClave.join(", ") : viewModal.pub.palabrasClave}
                </div>
                <div className="mb-4 text-gray-800">
                  <b>Resumen:</b> {viewModal.pub.resumen}
                </div>
                <div className="mb-8 whitespace-pre-line">
                  <b>Contenido:</b> {viewModal.pub.contenido}
                </div>
                <Button size="sm" variant="outline" onClick={() => setViewModal({ open: false, pub: null })} className="mt-2">
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {/* Modal para crear review */}
          {reviewModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
                <span
                  onClick={() => setReviewModal({ open: false, pubId: null })}
                  className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </span>
                <h2 className="text-lg font-bold mb-2">Crear revisión</h2>
                <label className="block text-sm font-medium mb-1">Estado de la revisión</label>
                <select className="w-full border rounded p-2 text-sm mb-4" value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} disabled={reviewLoading}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ACEPTADA">Aceptada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
                <textarea
                  className="w-full border rounded p-2 text-sm mb-4"
                  rows={4}
                  placeholder="Escribe tu comentario de revisión (ej: está bien, está mal, etc)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={reviewLoading}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleCreateReview(reviewModal.pubId)} disabled={reviewLoading || !reviewText.trim()}>
                    {reviewLoading ? "Enviando..." : "Enviar revisión"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReviewModal({ open: false, pubId: null })}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Paginación (solo para publicaciones a revisar) */}
          <div className="mt-4 flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)} size="sm">
              Anterior
            </Button>
            <span>Página {page}</span>
            <Button disabled={publications.length < limit} onClick={() => setPage(page + 1)} size="sm">
              Siguiente
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPublications;
