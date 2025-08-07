import apiClient from "./api";

export const publicationService = {
  // Cambiar solo el estado de la publicación (para editores y admin)
  updatePublicationEstado: async (id, data) => {
    try {
      const response = await apiClient.patch(`/publications/${id}/estado`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Enviar publicación a revisión
  submitForReview: async (id) => {
    try {
      const response = await apiClient.post(`/publications/${id}/submit-review`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Obtener todas las publicaciones con filtros
  getPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.tipo) queryParams.append("tipo", params.tipo);
      if (params.estado) queryParams.append("estado", params.estado);
      if (params.search) queryParams.append("search", params.search);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await apiClient.get(`/publications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener publicación por ID
  getPublicationById: async (id) => {
    try {
      const response = await apiClient.get(`/publications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nueva publicación
  createPublication: async (publicationData) => {
    try {
      const response = await apiClient.post("/publications", publicationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar publicación
  updatePublication: async (id, data) => {
    // Usar PATCH y la ruta correcta
    try {
      const response = await apiClient.patch(`/publications/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar publicación
  deletePublication: async (id) => {
    try {
      const response = await apiClient.delete(`/publications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener publicaciones del usuario actual (para autores)
  getMyPublications: async () => {
    try {
      const response = await apiClient.get("/publications/my-publications");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar estado de publicación
  changePublicationStatus: async (id, newStatus) => {
    try {
      const response = await apiClient.patch(`/publications/${id}/status`, {
        estado: newStatus,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
