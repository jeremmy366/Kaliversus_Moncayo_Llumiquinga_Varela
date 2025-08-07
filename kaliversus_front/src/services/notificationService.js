import axios from "axios";

const API_URL = "http://localhost:3000/notifications";

// Helper para obtener el token JWT del localStorage
function getAuthHeader() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const notificationService = {
  getAll: () => axios.get(`${API_URL}`, { headers: getAuthHeader() }),
  markAsRead: (id) => axios.patch(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() }),
  sendEmail: (data) => axios.post(`${API_URL}/send-email`, data, { headers: getAuthHeader() }),
  stream: () => axios.get(`${API_URL}/stream`, { headers: getAuthHeader() }), // Para SSE, se recomienda usar EventSource en el frontend
  testSse: () => axios.post(`${API_URL}/test-sse`, {}, { headers: getAuthHeader() }),
};

export default notificationService;
