import apiClient from "./api";

const API_URL = "/reviews";

const sugerencia = (data) => apiClient.post(`${API_URL}/sugerencia`, data);

const reviewService = {
  getAll: () => apiClient.get(`${API_URL}`),
  getById: (id) => apiClient.get(`${API_URL}/${id}`),
  // data: { publicacionId, revisorId, comentarios, estado, historialCambios }
  create: ({ publicacionId, revisorId, comentarios, estado, historialCambios }) =>
    apiClient.post(`${API_URL}`, {
      publicacionId,
      revisorId,
      comentarios,
      estado,
      historialCambios: historialCambios || [],
    }),
  assignReviewer: (publicacionId, data) => apiClient.post(`${API_URL}/publications/${publicacionId}/assign-reviewer`, data),
  getByPublication: (publicacionId) => apiClient.get(`${API_URL}/publications/${publicacionId}`),
  getMyReviews: () => apiClient.get(`${API_URL}/my-reviews`),
  update: (id, data) => apiClient.patch(`${API_URL}/${id}`, data),
  delete: (id) => apiClient.delete(`${API_URL}/${id}`),
  sugerencia,
};

export default reviewService;
