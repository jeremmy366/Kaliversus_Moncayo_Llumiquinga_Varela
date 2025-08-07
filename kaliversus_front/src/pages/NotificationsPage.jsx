import React, { useEffect, useState } from "react";
import notificationService from "../services/notificationService";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Modal para ver notificación
  const closeModal = () => setSelectedNotification(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSend, setShowSend] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    notificationService
      .getAll()
      .then((res) => {
        // Asegura que notifications sea siempre un array
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.notifications) ? res.data.notifications : [];
        setNotifications(data);
      })
      .catch(() => setError("No se pudieron cargar las notificaciones."))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (err) {
      setError("Error al marcar la notificación como leída");
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    setSendSuccess(null);
    try {
      await notificationService.sendEmail(emailData);
      setSendSuccess("¡Notificación enviada correctamente!");
      setEmailData({ to: "", subject: "", message: "" });
      setShowSend(false);
    } catch {
      setSendError("Error al enviar la notificación.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowSend((v) => !v)} size="sm" variant="outline">
            Enviar Notificación
          </Button>
          <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
            Volver al Dashboard
          </Button>
        </div>
      </div>
      {showSend && (
        <form onSubmit={handleSendEmail} className="mb-6 bg-white border rounded-lg p-6 space-y-4 shadow-sm">
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
            <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={sending}>
              {sending ? "Enviando..." : "Enviar"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowSend(false)}>
              Cancelar
            </Button>
            {sendError && <span className="text-red-500 text-sm ml-2">{sendError}</span>}
            {sendSuccess && <span className="text-green-600 text-sm ml-2">{sendSuccess}</span>}
          </div>
        </form>
      )}
      <p className="text-gray-600 mb-6">Aquí verás tus notificaciones y podrás gestionarlas.</p>
      {loading ? (
        <p>Cargando notificaciones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : notifications.length === 0 ? (
        <p>No tienes notificaciones.</p>
      ) : (
        <>
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className={`border rounded-lg p-6 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${n.leida ? "opacity-60" : ""}`}>
                <div>
                  <div className="font-medium text-base mb-1">{n.titulo || n.title || "Notificación"}</div>
                  <div className="text-gray-600 text-sm mb-1">{n.mensaje || n.message}</div>
                  <div className="text-xs text-gray-400">{n.fecha || n.createdAt || ""}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => setSelectedNotification(n)}>
                    Ver
                  </Button>
                  {!n.leida && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)}>
                      Marcar como leída
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Modal para ver notificación */}
          {selectedNotification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold">
                  &times;
                </button>
                <h2 className="text-lg font-bold mb-2">{selectedNotification.titulo || selectedNotification.title || "Notificación"}</h2>
                <div className="mb-2 text-sm text-gray-500">
                  <span className="font-medium">Para:</span> {selectedNotification.para || selectedNotification.to || "-"}
                </div>
                <div className="mb-2 text-sm text-gray-500">
                  <span className="font-medium">Asunto:</span> {selectedNotification.asunto || selectedNotification.subject || "-"}
                </div>
                <div className="mb-4 text-gray-700 whitespace-pre-line">{selectedNotification.mensaje || selectedNotification.message || "(Sin contenido)"}</div>
                <div className="text-xs text-gray-400 mb-2">{selectedNotification.fecha || selectedNotification.createdAt || ""}</div>
                <Button size="sm" variant="outline" onClick={closeModal} className="mt-2">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
