import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BriefcaseIcon, UserGroupIcon, DocumentCheckIcon, ClockIcon, ChartBarIcon, AdjustmentsHorizontalIcon, BellIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { publicationService } from "../../services/publicationService";
import userService from "../../services/userService";
import reviewService from "../../services/reviewService";
import toast from "react-hot-toast";

const EditorDashboard = () => {
  const { user } = useAuth();

  // Modales para Ver Todas y Reportes
  const [showAllModal, setShowAllModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  // Configuración de workflow: modo ('profesional' o 'minimalista')
  const [workflowMode, setWorkflowMode] = useState("profesional");
  // Modal calendario
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Acción del editor sobre la publicación
  const handleEditorDecision = async (pubId, newEstado) => {
    try {
      // PATCH /publications/:id/estado solo requiere el nuevo estado
      await publicationService.updatePublicationEstado(pubId, { estado: newEstado });
      toast.success(`Publicación actualizada a estado: ${newEstado}`);
      // Refrescar publicaciones (traer todas, sin filtro de estado)
      setLoading(true);
      const pubs = await publicationService.getPublications();
      let pubsArr = [];
      if (pubs && Array.isArray(pubs.publications)) pubsArr = pubs.publications;
      else if (Array.isArray(pubs)) pubsArr = pubs;
      else if (pubs && Array.isArray(pubs.data)) pubsArr = pubs.data;
      setPublications(pubsArr);
    } catch (err) {
      // Mostrar error detallado si lo hay
      console.error("Error updatePublicationEstado:", err?.response?.data || err);
      const msg = err?.response?.data?.message || err?.response?.data || err.message || "Error al actualizar publicación";
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Estado real
  const [publications, setPublications] = useState([]);
  const [reviewsByPublication, setReviewsByPublication] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revisors, setRevisors] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [editingReview, setEditingReview] = useState(null); // Si es edición de review
  const [assignForm, setAssignForm] = useState({ comentarios: "", estado: "PENDIENTE" });
  const [assignLoading, setAssignLoading] = useState(false);

  // Stats
  const stats = {
    enRevision: publications.length,
    pendientesAprobacion: publications.filter((p) => p.estado === "PENDIENTE_APROBACION").length,
    aprobadas: publications.filter((p) => p.estado === "APROBADO").length,
    revisoresActivos: revisors.length, // Solo revisores de la base de datos
  };
  // Modal para ver detalles de publicación
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPublication, setDetailPublication] = useState(null);
  const openDetailModal = (pub) => {
    setDetailPublication(pub);
    setShowDetailModal(true);
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailPublication(null);
  };

  // Cargar publicaciones EN_REVISION y revisores
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Traer todas las publicaciones (sin filtro de estado)
        const pubs = await publicationService.getPublications();
        let pubsArr = [];
        if (pubs && Array.isArray(pubs.publications)) pubsArr = pubs.publications;
        else if (Array.isArray(pubs)) pubsArr = pubs;
        else if (pubs && Array.isArray(pubs.data)) pubsArr = pubs.data;
        setPublications(pubsArr);

        // Obtener revisores (solo ADMIN puede ver todos, pero aquí asumimos editor también)
        const usersResp = await userService.getUsers(1, 100);
        // Mostrar en consola la respuesta real
        console.log("Respuesta de /users:", usersResp);
        let usersArr = [];
        if (Array.isArray(usersResp)) usersArr = usersResp;
        else if (usersResp.data && Array.isArray(usersResp.data)) usersArr = usersResp.data;
        else if (usersResp.users && Array.isArray(usersResp.users)) usersArr = usersResp.users;
        else if (usersResp.results && Array.isArray(usersResp.results)) usersArr = usersResp.results;
        // Filtrar solo revisores de la base de datos (no hardcode)
        const revisores = usersArr.filter((u) => Array.isArray(u.roles) && (u.roles.includes("REVISOR") || u.roles.includes("ROLE_REVISOR")));
        setRevisors(revisores);
        // Obtener reviews para cada publicación
        const reviewsMap = {};
        for (const pub of pubsArr) {
          try {
            const reviews = await reviewService.getByPublication(pub.id);
            reviewsMap[pub.id] = Array.isArray(reviews) ? reviews : reviews.data || [];
          } catch (e) {
            reviewsMap[pub.id] = [];
          }
        }
        setReviewsByPublication(reviewsMap);
      } catch (err) {
        setError("Error al cargar publicaciones o revisores");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal handlers
  // Abrir modal para crear o editar review
  const openAssignModal = (pub, review = null) => {
    setSelectedPublication(pub);
    if (review) {
      const [showAssignModal, setShowAssignModal] = useState(false);
      const [selectedPublication, setSelectedPublication] = useState(null);
      const [editingReview, setEditingReview] = useState(null); // Si es edición de review
      const [assignForm, setAssignForm] = useState({ comentarios: "", estado: "PENDIENTE" });
      const [assignLoading, setAssignLoading] = useState(false);
      setEditingReview(review);
      setAssignForm({ comentarios: review.comentarios || "", estado: "EN_PROCESO" });
    } else {
      setEditingReview(null);
      setAssignForm({ comentarios: "", estado: "PENDIENTE" });
    }
    setShowAssignModal(true);
  };
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedPublication(null);
    setEditingReview(null);
  };
  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      if (editingReview) {
        // Actualizar review existente
        await reviewService.update(editingReview.id, {
          comentarios: assignForm.comentarios,
          estado: assignForm.estado,
          historialCambios: {
            updatedBy: user.id,
            updatedAt: new Date().toISOString(),
          },
        });
        toast.success("Review actualizada correctamente");
      } else {
        // Crear nueva review
        await reviewService.create({
          publicacionId: selectedPublication.id,
          revisorId: user.id,
          comentarios: assignForm.comentarios,
          estado: "PENDIENTE",
          historialCambios: {
            assignedBy: user.id,
            assignedAt: new Date().toISOString(),
          },
        });
        toast.success("Review creada correctamente");
      }
      closeAssignModal();
      // Refrescar publicaciones
      setLoading(true);
      const pubs = await publicationService.getPublications({ estado: "EN_REVISION" });
      let pubsArr = [];
      if (pubs && Array.isArray(pubs.publications)) pubsArr = pubs.publications;
      else if (Array.isArray(pubs)) pubsArr = pubs;
      else if (pubs && Array.isArray(pubs.data)) pubsArr = pubs.data;
      setPublications(pubsArr);
    } catch (err) {
      toast.error("Error al guardar review");
    } finally {
      setAssignLoading(false);
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    const colors = {
      EN_REVISION: "text-yellow-600 bg-yellow-100",
      PENDIENTE_APROBACION: "text-blue-600 bg-blue-100",
      CAMBIOS_SOLICITADOS: "text-red-600 bg-red-100",
      APROBADO: "text-green-600 bg-green-100",
      PUBLICADO: "text-green-700 bg-green-100",
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard del Editor</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombres} {user?.apellidos} - Gestiona el proceso editorial
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enRevision}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes Aprobación</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientesAprobacion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aprobadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Editoriales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="flex items-center space-x-2 justify-center" onClick={() => setShowAllModal(true)}>
                <UserGroupIcon className="h-4 w-4" />
                <span>Ver Todas</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 justify-center" onClick={() => setShowReportModal(true)}>
                <ChartBarIcon className="h-4 w-4" />
                <span>Reportes</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 justify-center" onClick={() => setShowWorkflowModal(true)}>
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Configurar Workflow</span>
              </Button>
            </div>
            {/* Modal Configurar Workflow */}
            {showWorkflowModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowWorkflowModal(false)}>
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Configurar Workflow Editorial</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success(
                        workflowMode === "profesional"
                          ? "Configuración guardada: Modo Profesional (flujo completo, varios revisores)."
                          : "Configuración guardada: Modo Minimalista (flujo rápido, un solo revisor)."
                      );
                      setShowWorkflowModal(false);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Opción Profesional */}
                      <button
                        type="button"
                        className={`border rounded-lg p-4 flex flex-col items-center transition focus:outline-none ${
                          workflowMode === "profesional" ? "border-blue-600 bg-blue-50 shadow" : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setWorkflowMode("profesional")}
                      >
                        <span className="font-bold text-blue-700 mb-2">Profesional</span>
                        <span className="text-sm text-gray-700 text-center">
                          Flujo editorial completo: requiere revisión de varios revisores antes de la decisión final del editor. Recomendado para procesos rigurosos.
                        </span>
                      </button>
                      {/* Opción Minimalista */}
                      <button
                        type="button"
                        className={`border rounded-lg p-4 flex flex-col items-center transition focus:outline-none ${
                          workflowMode === "minimalista" ? "border-green-600 bg-green-50 shadow" : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setWorkflowMode("minimalista")}
                      >
                        <span className="font-bold text-green-700 mb-2">Minimalista</span>
                        <span className="text-sm text-gray-700 text-center">
                          Flujo rápido: basta con la revisión de un solo revisor para que el editor tome la decisión. Ideal para procesos ágiles.
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowWorkflowModal(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Ver Todas */}
            {showAllModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowAllModal(false)}>
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Todas las Publicaciones</h2>
                  <div className="space-y-2">
                    {publications.length === 0 ? (
                      <p className="text-gray-500">No hay publicaciones registradas.</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {publications.map((pub) => (
                          <li key={pub.id} className="py-2">
                            <span className="font-semibold">{pub.titulo}</span> — <span className="text-sm text-gray-600">{pub.estado}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setShowAllModal(false)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Reportes */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowReportModal(false)}>
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Reportes</h2>
                  <p className="text-gray-700 mb-4">Gráfico de publicaciones por estado</p>
                  <Bar
                    data={{
                      labels: Array.from(new Set(publications.map((p) => p.estado))),
                      datasets: [
                        {
                          label: "Cantidad de publicaciones",
                          data: Array.from(new Set(publications.map((p) => p.estado))).map((estado) => publications.filter((p) => p.estado === estado).length),
                          backgroundColor: [
                            "#fbbf24", // amarillo
                            "#3b82f6", // azul
                            "#10b981", // verde
                            "#ef4444", // rojo
                            "#6366f1", // violeta
                            "#f59e42", // naranja
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      },
                    }}
                  />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setShowReportModal(false)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Workflow Editorial</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowCalendarModal(true)}>
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Ver Calendario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Modal Calendario */}
          {showCalendarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCalendarModal(false)}>
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Calendario Editorial</h2>
                <div className="mb-4 text-gray-700">
                  Aquí puedes visualizar las fechas clave del proceso editorial. (Ejemplo visual, conecta tu calendario real si lo deseas)
                </div>
                {/* Calendario minimalista de ejemplo */}
                <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                  <div className="font-semibold mb-2">Agosto 2025</div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    <div className="font-bold">L</div>
                    <div className="font-bold">M</div>
                    <div className="font-bold">X</div>
                    <div className="font-bold">J</div>
                    <div className="font-bold">V</div>
                    <div className="font-bold">S</div>
                    <div className="font-bold">D</div>
                    {/* Días del mes (1-31, ejemplo estático) */}
                    {Array.from({ length: 31 }, (_, i) => (
                      <div key={i} className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 cursor-pointer">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Cargando publicaciones...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : publications.length === 0 ? (
              <p className="text-gray-500">No hay publicaciones en revisión.</p>
            ) : (
              publications.map((pub) => {
                // Mostrar reviews de revisores y opción de decisión final para el editor
                const reviews = reviewsByPublication[pub.id] || [];
                return (
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
                            {pub.autorPrincipal?.nombres ? `${pub.autorPrincipal.nombres} ${pub.autorPrincipal.apellidos}` : pub.autorPrincipalId || "-"}
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
                        {/* Mostrar reviews de revisores */}
                        <div className="mt-2">
                          <span className="font-semibold text-gray-700">Reviews de Revisores:</span>
                          {reviews.length === 0 ? (
                            <div className="text-sm text-gray-500">No hay reviews de revisores aún.</div>
                          ) : (
                            <ul className="mt-1 space-y-2">
                              {reviews.map((rev) => (
                                <li key={rev.id} className="border rounded p-2 bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Revisor:</span>
                                    <span>{rev.revisorNombre || rev.revisorId}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Estado:</span> {rev.estado}
                                  </div>
                                  <div>
                                    <span className="font-medium">Comentarios:</span> {rev.comentarios}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {/* Decisión final del editor */}
                        {pub.estado === "EN_REVISION" && (
                          <div className="mt-4">
                            <span className="font-semibold text-gray-700">Decisión del Editor:</span>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditorDecision(pub.id, "APROBADO")}>
                                Aprobar publicación
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditorDecision(pub.id, "CAMBIOS_SOLICITADOS")}>
                                Solicitar cambios
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditorDecision(pub.id, "RETIRADO")}>
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openDetailModal(pub)}>
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Modal para ver detalles de publicación */}
            {showDetailModal && detailPublication && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeDetailModal}>
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Detalles de la Publicación</h2>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Título:</span> {detailPublication.titulo}
                    </div>
                    <div>
                      <span className="font-semibold">Autor Principal:</span>{" "}
                      {detailPublication.autorPrincipal?.nombres
                        ? `${detailPublication.autorPrincipal.nombres} ${detailPublication.autorPrincipal.apellidos}`
                        : detailPublication.autorPrincipalId || "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo:</span> {detailPublication.tipo}
                    </div>
                    <div>
                      <span className="font-semibold">Fecha de Creación:</span>{" "}
                      {detailPublication.fechaCreacion ? new Date(detailPublication.fechaCreacion).toLocaleDateString() : "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Estado:</span> {detailPublication.estado}
                    </div>
                    {detailPublication.resumen && (
                      <div>
                        <span className="font-semibold">Resumen:</span> {detailPublication.resumen}
                      </div>
                    )}
                    {detailPublication.palabras_clave && (
                      <div>
                        <span className="font-semibold">Palabras Clave:</span>{" "}
                        {Array.isArray(detailPublication.palabras_clave) ? detailPublication.palabras_clave.join(", ") : detailPublication.palabras_clave}
                      </div>
                    )}
                    {detailPublication.contenido && (
                      <div>
                        <span className="font-semibold">Contenido:</span>{" "}
                        <div className="whitespace-pre-line border rounded p-2 bg-gray-50 mt-1">{detailPublication.contenido}</div>
                      </div>
                    )}
                    {detailPublication.metadatos && typeof detailPublication.metadatos === "object" && Object.keys(detailPublication.metadatos).length > 0 && (
                      <div>
                        <span className="font-semibold">Metadatos:</span>
                        <ul className="bg-gray-50 rounded p-2 mt-1 text-sm space-y-1">
                          {Object.entries(detailPublication.metadatos)
                            .filter(([key]) => key.toLowerCase() !== "doi")
                            .map(([key, value]) => (
                              <li key={key}>
                                <span className="font-medium">{key}:</span> {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={closeDetailModal}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para asignar revisor y mostrar detalles de publicación */}
      {showAssignModal && selectedPublication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeAssignModal}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Detalles de la Publicación</h2>
            <div className="space-y-2 mb-6">
              <div>
                <span className="font-semibold">Título:</span> {selectedPublication.titulo}
              </div>
              <div>
                <span className="font-semibold">Autor Principal:</span>{" "}
                {selectedPublication.autorPrincipal?.nombres
                  ? `${selectedPublication.autorPrincipal.nombres} ${selectedPublication.autorPrincipal.apellidos}`
                  : selectedPublication.autorPrincipalId || "-"}
              </div>
              <div>
                <span className="font-semibold">Tipo:</span> {selectedPublication.tipo}
              </div>
              <div>
                <span className="font-semibold">Fecha de Creación:</span>{" "}
                {selectedPublication.fechaCreacion ? new Date(selectedPublication.fechaCreacion).toLocaleDateString() : "-"}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {selectedPublication.estado}
              </div>
              {selectedPublication.resumen && (
                <div>
                  <span className="font-semibold">Resumen:</span> {selectedPublication.resumen}
                </div>
              )}
              {selectedPublication.palabras_clave && (
                <div>
                  <span className="font-semibold">Palabras Clave:</span>{" "}
                  {Array.isArray(selectedPublication.palabras_clave) ? selectedPublication.palabras_clave.join(", ") : selectedPublication.palabras_clave}
                </div>
              )}
              {selectedPublication.contenido && (
                <div>
                  <span className="font-semibold">Contenido:</span>{" "}
                  <div className="whitespace-pre-line border rounded p-2 bg-gray-50 mt-1">{selectedPublication.contenido}</div>
                </div>
              )}
              {selectedPublication.metadatos && typeof selectedPublication.metadatos === "object" && Object.keys(selectedPublication.metadatos).length > 0 && (
                <div>
                  <span className="font-semibold">Metadatos:</span>
                  <ul className="bg-gray-50 rounded p-2 mt-1 text-sm space-y-1">
                    {Object.entries(selectedPublication.metadatos)
                      .filter(([key]) => key.toLowerCase() !== "doi")
                      .map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span> {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{editingReview ? "Gestionar Review" : "Crear Review"}</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Comentarios</label>
                <textarea
                  name="comentarios"
                  value={assignForm.comentarios}
                  onChange={handleAssignChange}
                  required
                  rows={3}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Escribe tus comentarios sobre la publicación..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  name="estado"
                  value={assignForm.estado}
                  onChange={handleAssignChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                  disabled={!editingReview && assignForm.estado !== "PENDIENTE"}
                >
                  {/* Si es edición, puede elegir cualquier estado. Si es nuevo, solo PENDIENTE (deshabilitado) */}
                  {!editingReview && <option value="PENDIENTE">Pendiente</option>}
                  <option value="DEVUELTA">Devuelta</option>
                  <option value="ACEPTADA">Aceptada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeAssignModal} disabled={assignLoading}>
                  Cancelar
                </Button>
                <Button type="submit" loading={assignLoading} disabled={assignLoading}>
                  {editingReview ? "Guardar Cambios" : "Crear Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorDashboard;
