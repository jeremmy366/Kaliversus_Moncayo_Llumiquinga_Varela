import axios from "axios";

// URL directa del backend para APIs públicas
const API_BASE_URL = "http://localhost:3000";

// Crear instancia de axios para APIs públicas (sin autenticación)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor simple para manejar errores sin redirección automática
publicApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // No redirigir automáticamente, solo rechazar la promesa
    return Promise.reject(error);
  }
);

export default publicApiClient;
