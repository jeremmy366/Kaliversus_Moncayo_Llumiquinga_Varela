import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import reviewService from "../../services/reviewService";
import { publicationService } from "../../services/publicationService";

// Configuración de localizer para react-big-calendar
const locales = {
  es: esLocale,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const normalizeRoles = (roles) => {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    if (roles.length === 0) return [];
    if (typeof roles[0] === "string") {
      return roles.map((nombre) => ({ nombre }));
    }
    if (typeof roles[0] === "object" && roles[0].nombre) {
      return roles;
    }
  }
  if (typeof roles === "string") {
    return [{ nombre: roles }];
  }
  return [];
};

const RevisorDashboard = () => {
  const { user: rawUser } = useAuth();
  // Normalizar roles para asegurar formato correcto
  const user = {
    ...rawUser,
    roles: normalizeRoles(rawUser?.roles),
  };

  // Estado para revisiones, publicaciones y estadísticas
  const [assignedReviews, setAssignedReviews] = useState([]);
  const [publicationsToReview, setPublicationsToReview] = useState([]);
  const [stats, setStats] = useState({ asignadas: 0, pendientes: 0, completadas: 0, enProceso: 0 });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado y handlers para el modal de dejar review
  // Handlers para acciones rápidas
  const handleShowAllReviews = () => setShowAllReviews(true);
  const handleCloseAllReviews = () => setShowAllReviews(false);
  const handleShowCalendar = () => setShowCalendar(true);
  const handleCloseCalendar = () => setShowCalendar(false);
  const handleShowMessages = () => setShowMessages(true);
  const handleCloseMessages = () => setShowMessages(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [reviewForm, setReviewForm] = useState({ comentarios: "", estado: "ACEPTADA" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Estado para modal de ver publicación
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPublication, setViewPublication] = useState(null);

  const handleOpenViewModal = (pub) => {
    setViewPublication(pub);
    setShowViewModal(true);
  };
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewPublication(null);
  };

  const handleOpenReviewModal = (pub) => {
    setSelectedPublication(pub);
    setShowReviewModal(true);
    setReviewForm({ comentarios: "", estado: "ACEPTADA" });
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedPublication(null);
    setReviewForm({ comentarios: "", estado: "ACEPTADA" });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedPublication) return;
    setReviewLoading(true);
    try {
      // Verificar si la publicación seleccionada está en las asignadas
      const isAssigned = assignedReviews.some((r) => r.publicacionId === selectedPublication.id || r.publicacion?.id === selectedPublication.id);
      if (isAssigned) {
        await reviewService.create({
          publicacionId: selectedPublication.id,
          comentarios: reviewForm.comentarios,
          estado: reviewForm.estado,
          revisorId: String(user.id),
          historialCambios: {},
        });
        toast.success("Review enviada correctamente");
      } else {
        await reviewService.sugerencia({
          publicacionId: selectedPublication.id,
          comentarios: reviewForm.comentarios, // Usar plural, como espera el backend
          calificacion: 0,
          tipo: "SUGERENCIA",
        });
        toast.success("Sugerencia enviada correctamente");
      }
      closeReviewModal();
      // Refrescar publicaciones y revisiones tras enviar
      if (typeof user?.id !== "undefined") {
        await fetchData();
      }
    } catch (err) {
      let msg = "Error al enviar review o sugerencia";
      if (err && err.response && err.response.data && err.response.data.message) {
        msg += ": " + err.response.data.message;
      } else if (err && err.message) {
        msg += ": " + err.message;
      } else if (typeof err === "string") {
        msg += ": " + err;
      }
      toast.error(msg);
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Solo cargar revisiones asignadas al revisor
  // Función para refrescar publicaciones y revisiones
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let reviews = [];
    let pubsArr = [];
    // Intentar cargar revisiones asignadas si el usuario es revisor
    if (user?.rol === "REVISOR" || user?.role === "REVISOR") {
      try {
        const resp = await reviewService.getMyReviews();
        if (Array.isArray(resp)) {
          reviews = resp;
        } else if (resp && Array.isArray(resp.data)) {
          reviews = resp.data;
        } else if (resp && Array.isArray(resp.reviews)) {
          reviews = resp.reviews;
        }
      } catch {}
    }
    // Cargar todas las publicaciones (sin filtro de estado)
    try {
      const pubsResp = await publicationService.getPublications();
      if (pubsResp && Array.isArray(pubsResp.publications)) pubsArr = pubsResp.publications;
      else if (Array.isArray(pubsResp)) pubsArr = pubsResp;
      else if (pubsResp && Array.isArray(pubsResp.data)) pubsArr = pubsResp.data;
    } catch {}
    setAssignedReviews(reviews);
    setStats({
      asignadas: reviews.length || 0,
      pendientes: reviews.filter((r) => r.estado === "PENDIENTE").length || 0,
      completadas: reviews.filter((r) => r.estado === "ACEPTADA" || r.estado === "RECHAZADA").length || 0,
      enProceso: reviews.filter((r) => r.estado === "EN_PROCESO").length || 0,
    });
    setPublicationsToReview(pubsArr);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const getStatusColor = (estado) => {
    const colors = {
      PENDIENTE: "text-red-600 bg-red-100",
      EN_PROCESO: "text-yellow-600 bg-yellow-100",
      ACEPTADA: "text-green-600 bg-green-100",
      RECHAZADA: "text-gray-600 bg-gray-100",
      DEVUELTA: "text-blue-600 bg-blue-100",
    };
    return colors[estado] || "text-gray-600 bg-gray-100";
  };

  const getPriorityColor = (prioridad) => {
    const colors = {
      ALTA: "text-red-700 bg-red-50 border-red-200",
      MEDIA: "text-yellow-700 bg-yellow-50 border-yellow-200",
      BAJA: "text-green-700 bg-green-50 border-green-200",
    };
    return colors[prioridad] || "text-gray-700 bg-gray-50 border-gray-200";
  };

  const getDaysRemaining = (fechaLimite) => {
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Cargando revisiones...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard del Revisor</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombres} {user?.apellidos} - Gestiona tus revisiones asignadas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Publicaciones</p>
                <p className="text-2xl font-bold text-gray-900">{publicationsToReview.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Asignadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.asignadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enProceso}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button className="flex items-center space-x-2" onClick={handleShowAllReviews}>
                <ClipboardDocumentListIcon className="h-4 w-4" />
                <span>Ver Todas las Revisiones</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2" onClick={handleShowCalendar}>
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Calendario de Revisiones</span>
              </Button>
              {/* Botón de mensajes eliminado */}
              {/* Modal para ver todas las revisiones */}
              {showAllReviews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleCloseAllReviews}>
                      &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-4">Todas las Revisiones</h2>
                    <div className="space-y-4 max-h-96 overflow-auto">
                      {assignedReviews.length > 0 ? (
                        assignedReviews.map((review) => (
                          <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-semibold">{review.publicacionTitulo || review.titulo || review.publicacion?.titulo || "Sin título"}</div>
                            <div className="text-sm text-gray-600">Estado: {review.estado}</div>
                            <div className="text-sm text-gray-600">Fecha: {review.fechaAsignacion || review.fecha_asignacion || review.createdAt?.slice(0, 10) || "-"}</div>
                            <div className="text-sm text-gray-600">Comentarios: {review.comentarios || "-"}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No tienes revisiones asignadas.</p>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" onClick={handleCloseAllReviews}>
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para calendario con React Big Calendar (siempre montado, solo oculto con CSS) */}
              <div
                className={showCalendar ? "fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40" : "hidden"}
                style={{ pointerEvents: showCalendar ? "auto" : "none" }}
              >
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative" style={{ pointerEvents: "auto" }}>
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleCloseCalendar}>
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Calendario de Revisiones</h2>
                  <div style={{ height: 500, background: "white", borderRadius: 8, pointerEvents: "auto" }}>
                    <BigCalendar
                      localizer={localizer}
                      events={assignedReviews
                        .filter((r) => r.fechaAsignacion || r.fecha_asignacion || r.createdAt)
                        .map((r) => ({
                          title: r.publicacionTitulo || r.titulo || r.publicacion?.titulo || "Sin título",
                          start: new Date(r.fechaAsignacion || r.fecha_asignacion || r.createdAt),
                          end: new Date(r.fechaLimite || r.fecha_limite || r.deadline || r.fechaAsignacion || r.fecha_asignacion || r.createdAt),
                          allDay: true,
                          resource: r,
                        }))}
                      startAccessor="start"
                      endAccessor="end"
                      titleAccessor="title"
                      messages={{
                        next: "Sig.",
                        previous: "Ant.",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        agenda: "Agenda",
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "No hay revisiones en este rango",
                      }}
                      culture="es"
                      popup
                      views={["month", "week", "day", "agenda"]}
                      defaultView="month"
                      defaultDate={new Date()}
                      style={{ background: "white", borderRadius: 8, pointerEvents: "auto" }}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={handleCloseCalendar}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal de mensajes eliminado */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revisiones Asignadas */}
      {assignedReviews.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revisiones Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedReviews.map((review) => {
                const daysRemaining = getDaysRemaining(review.fechaLimite || review.fecha_limite || review.deadline);
                return (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{review.publicacionTitulo || review.titulo || review.publicacion?.titulo || "Sin título"}</h3>
                          {review.prioridad && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(review.prioridad)}`}>
                              {review.prioridad}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Autor: <span className="font-medium">{review.autorNombre || review.autor || review.publicacion?.autor || "-"}</span>
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>Asignada: {review.fechaAsignacion || review.fecha_asignacion || review.createdAt?.slice(0, 10) || "-"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span className={daysRemaining <= 3 ? "text-red-600 font-medium" : ""}>
                              Límite: {review.fechaLimite || review.fecha_limite || review.deadline || "-"} ({isNaN(daysRemaining) ? "-" : `${daysRemaining} días`})
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>{review.tipo || review.tipo_publicacion || ""}</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.estado)}`}>
                            {review.estado ? review.estado.replace("_", " ") : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm" className="flex items-center space-x-1" onClick={() => handleOpenViewModal(review.publicacion || review)}>
                          <EyeIcon className="h-4 w-4" />
                          <span>Ver</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publicaciones en revisión (siempre visibles) */}
      <Card>
        <CardHeader>
          <CardTitle>Publicaciones en Revisión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publicationsToReview.length > 0 ? (
              <React.Fragment>
                <p className="text-gray-500">Puedes dejar un review o sugerencia en cualquier publicación:</p>
                {publicationsToReview.map((pub) => (
                  <div key={pub.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{pub.titulo || "Sin título"}</h3>
                          {pub.prioridad && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(pub.prioridad)}`}>
                              {pub.prioridad}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Autor:</span>{" "}
                            {pub.autorPrincipal
                              ? pub.autorPrincipal.nombres || pub.autorPrincipal.apellidos
                                ? `${pub.autorPrincipal.nombres || ""} ${pub.autorPrincipal.apellidos || ""}`.trim()
                                : pub.autorPrincipal.email || pub.autorPrincipal.id || "-"
                              : pub.autorPrincipalId || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {pub.tipo || ""}
                          </div>
                          <div>
                            <span className="font-medium">Fecha:</span> {pub.fechaCreacion ? new Date(pub.fechaCreacion).toLocaleDateString() : "-"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pub.estado)}`}>
                            {pub.estado ? pub.estado.replace("_", " ") : "-"}
                          </span>
                          <span className="text-sm text-gray-500">{pub.tipo}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleOpenViewModal(pub)}>
                          <EyeIcon className="h-4 w-4" />
                          <span>Ver</span>
                        </Button>
                        <Button size="sm" onClick={() => handleOpenReviewModal(pub)}>
                          Dejar Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ) : (
              <p className="text-gray-500">No hay publicaciones en revisión.</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal para ver publicación */}
      {showViewModal && viewPublication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeViewModal}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Detalle de la Publicación</h2>
            <div className="mb-4 space-y-2">
              <div>
                <span className="font-semibold">Título:</span> {viewPublication.titulo || "Sin título"}
              </div>
              <div>
                <span className="font-semibold">Autor:</span>{" "}
                {viewPublication.autorPrincipal
                  ? viewPublication.autorPrincipal.nombres || viewPublication.autorPrincipal.apellidos
                    ? `${viewPublication.autorPrincipal.nombres || ""} ${viewPublication.autorPrincipal.apellidos || ""}`.trim()
                    : viewPublication.autorPrincipal.email || viewPublication.autorPrincipal.id || "-"
                  : viewPublication.autorPrincipalId || "-"}
              </div>
              <div>
                <span className="font-semibold">Tipo:</span> {viewPublication.tipo || "-"}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {viewPublication.estado || "-"}
              </div>
              <div>
                <span className="font-semibold">Prioridad:</span> {viewPublication.prioridad || "-"}
              </div>
              <div>
                <span className="font-semibold">Fecha de creación:</span> {viewPublication.fechaCreacion ? new Date(viewPublication.fechaCreacion).toLocaleDateString() : "-"}
              </div>
              <div>
                <span className="font-semibold">Resumen:</span> {viewPublication.resumen || viewPublication.descripcion || "Sin resumen"}
              </div>
              <div>
                <span className="font-semibold">Contenido:</span>
                <div className="whitespace-pre-line border rounded p-2 mt-1 bg-gray-50 text-sm max-h-60 overflow-auto">{viewPublication.contenido || "Sin contenido"}</div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={closeViewModal}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisorDashboard;
