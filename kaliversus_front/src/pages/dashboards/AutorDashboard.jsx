import React, { useState, useEffect } from "react";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PlusIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, EyeIcon, PencilIcon, ChartBarIcon, BellIcon } from "@heroicons/react/24/outline";
import { publicationService } from "../../services/publicationService";
import { useNavigate } from "react-router-dom";

const AutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({
    totalPublicaciones: 0,
    enRevision: 0,
    publicadas: 0,
    borradores: 0,
  });
  const [recentPublications, setRecentPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [pubNotifications, setPubNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [markingId, setMarkingId] = useState(null);
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
  const handleMarkAsRead = async (id) => {
    setMarkingId(id);
    try {
      await notificationService.markAsRead(id);
      setPubNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch {
      toast.error("Error al marcar como leída");
    } finally {
      setMarkingId(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pubs = await publicationService.getMyPublications();
      const publicaciones = pubs.publications || [];
      setRecentPublications(publicaciones);
      // Calcular estadísticas
      const statsCalc = {
        totalPublicaciones: publicaciones.length,
        enRevision: publicaciones.filter((p) => p.estado === "EN_REVISION").length,
        publicadas: publicaciones.filter((p) => p.estado === "PUBLICADO").length,
        borradores: publicaciones.filter((p) => p.estado === "BORRADOR").length,
      };
      setStats(statsCalc);
    } catch (e) {
      setError("No se pudieron cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Cargar notificaciones relacionadas a publicaciones
    setNotifLoading(true);
    notificationService
      .getAll()
      .then((res) => {
        // Filtrar solo notificaciones relacionadas a publicaciones
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.notifications) ? res.data.notifications : [];
        const pubNotifs = data.filter(
          (n) => n.tipo === "PUBLICACION" || n.publicacionId || n.titulo?.toLowerCase().includes("publicacion") || n.mensaje?.toLowerCase().includes("publicacion")
        );
        setPubNotifications(pubNotifs);
      })
      .catch(() => setPubNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  const handleSubmitForReview = async (id) => {
    setSubmittingId(id);
    try {
      await publicationService.submitForReview(id);
      toast.success("¡Enviado a revisión!");
      await fetchData();
    } catch (e) {
      toast.error(e?.message || "Error al enviar a revisión");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusColor = (estado) => {
    const colors = {
      BORRADOR: "text-gray-600 bg-gray-100",
      EN_REVISION: "text-yellow-600 bg-yellow-100",
      PUBLICADO: "text-green-600 bg-green-100",
      APROBADO: "text-blue-600 bg-blue-100",
      CAMBIOS_SOLICITADOS: "text-red-600 bg-red-100",
    };
    return colors[estado] || "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-8 mt-8">Cargando publicaciones...</div>;
  }
  if (error) {
    return <div className="max-w-2xl mx-auto p-8 mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard del Autor</h1>
          {(user?.role === "ADMIN" || user?.role === "AUTOR" || (Array.isArray(user?.roles) && (user.roles.includes("ADMIN") || user.roles.includes("AUTOR")))) && (
            <Button size="sm" variant="outline" onClick={() => setShowEmailModal(true)}>
              Enviar Notificación
            </Button>
          )}
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
        {/* Notificaciones de publicaciones */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-blue-500" /> Notificaciones de publicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifLoading ? (
                <div className="text-gray-500">Cargando notificaciones...</div>
              ) : pubNotifications.length === 0 ? (
                <div className="text-gray-400">No tienes notificaciones relacionadas a publicaciones.</div>
              ) : (
                <ul className="space-y-2">
                  {pubNotifications.map((n) => (
                    <li key={n.id} className={`border rounded p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${n.leida ? "opacity-60" : ""}`}>
                      <div>
                        <div className="font-medium text-sm">{n.titulo || n.title || "Notificación"}</div>
                        <div className="text-gray-600 text-xs mb-1 line-clamp-2">{n.mensaje || n.message}</div>
                        <div className="text-xs text-gray-400">{n.fecha || n.createdAt || ""}</div>
                      </div>
                      <div className="flex gap-2 items-center mt-2 md:mt-0">
                        <Button size="sm" variant="outline" onClick={() => setSelectedNotif(n)}>
                          Ver completo
                        </Button>
                        {!n.leida && (
                          <Button size="sm" variant="outline" loading={markingId === n.id} disabled={markingId === n.id} onClick={() => handleMarkAsRead(n.id)}>
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Modal para ver notificación completa */}
              {selectedNotif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
                    <button onClick={() => setSelectedNotif(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold">
                      &times;
                    </button>
                    <h2 className="text-lg font-bold mb-2">{selectedNotif.titulo || selectedNotif.title || "Notificación"}</h2>
                    <div className="mb-2 text-sm text-gray-500">
                      <span className="font-medium">Para:</span> {selectedNotif.para || selectedNotif.to || "-"}
                    </div>
                    <div className="mb-2 text-sm text-gray-500">
                      <span className="font-medium">Asunto:</span> {selectedNotif.asunto || selectedNotif.subject || "-"}
                    </div>
                    <div className="mb-4 text-gray-700 whitespace-pre-line">{selectedNotif.mensaje || selectedNotif.message || "(Sin contenido)"}</div>
                    <div className="text-xs text-gray-400 mb-2">{selectedNotif.fecha || selectedNotif.createdAt || ""}</div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedNotif(null)} className="mt-2">
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard del Autor</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.nombres} {user?.apellidos}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Publicaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPublicaciones}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publicadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publicadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PencilIcon className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.borradores}</p>
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
                <Button className="flex items-center space-x-2" onClick={() => navigate("/publications/create")}>
                  <PlusIcon className="h-4 w-4" />
                  <span>Nueva Publicación</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2" onClick={() => navigate("/autor/estadisticas")}>
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Ver Estadísticas</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2" onClick={() => navigate("/autor/plantillas")}>
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Plantillas</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2" onClick={() => setShowEmailModal(true)}>
                  <BellIcon className="h-4 w-4" />
                  <span>Enviar Notificación</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Publications */}
        <Card>
          <CardHeader>
            <CardTitle>Publicaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPublications.length === 0 ? (
                <div className="text-gray-500">No tienes publicaciones registradas.</div>
              ) : (
                recentPublications.map((pub) => (
                  <div key={pub.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{pub.titulo}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pub.estado)}`}>
                          {pub.estado?.replace("_", " ")}
                        </span>
                        <span className="text-sm text-gray-500">{pub.tipo}</span>
                        <span className="text-sm text-gray-500">{pub.fechaCreacion ? new Date(pub.fechaCreacion).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/publications/${pub.id}`)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {pub.estado === "BORRADOR" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/publications/${pub.id}/edit`)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            loading={submittingId === pub.id}
                            disabled={submittingId === pub.id}
                            onClick={() => handleSubmitForReview(pub.id)}
                          >
                            Enviar a revisión
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutorDashboard;
