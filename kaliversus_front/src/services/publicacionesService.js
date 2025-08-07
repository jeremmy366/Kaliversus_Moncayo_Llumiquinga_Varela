import apiClient from "./api";

export const publicacionesService = {
  // Obtener todas las publicaciones (para el catálogo público)
  getPublicaciones: async (params = {}) => {
    try {
      const response = await apiClient.get("/catalogo/publicaciones", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener publicación por ID
  getPublicacionById: async (id) => {
    try {
      const response = await apiClient.get(`/catalogo/publicaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Buscar publicaciones
  searchPublicaciones: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const response = await apiClient.get("/catalogo/buscar", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener publicaciones por categoría
  getPublicacionesByCategoria: async (categoria) => {
    try {
      const response = await apiClient.get(`/catalogo/categoria/${categoria}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener publicaciones destacadas
  getPublicacionesDestacadas: async () => {
    try {
      const response = await apiClient.get("/catalogo/destacadas");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Para autores autenticados - CRUD de sus publicaciones
  crearPublicacion: async (publicacionData) => {
    try {
      const response = await apiClient.post("/publicaciones", publicacionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  actualizarPublicacion: async (id, publicacionData) => {
    try {
      const response = await apiClient.put(`/publicaciones/${id}`, publicacionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  eliminarPublicacion: async (id) => {
    try {
      const response = await apiClient.delete(`/publicaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener mis publicaciones (autor autenticado)
  getMisPublicaciones: async () => {
    try {
      const response = await apiClient.get("/publicaciones/mis-publicaciones");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enviar publicación a revisión
  enviarARevision: async (id) => {
    try {
      const response = await apiClient.post(`/publicaciones/${id}/enviar-revision`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas de publicaciones
  getEstadisticas: async () => {
    try {
      const response = await apiClient.get("/catalogo/estadisticas");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default publicacionesService;
