import axios from "axios";

// URL directa del backend - sin /api en el path
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si no estamos ya en login o register
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
