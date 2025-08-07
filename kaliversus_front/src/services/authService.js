import apiClient from "./api";
import { mockAuthService } from "./mockAuthService";

// Verificar si usar mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    if (USE_MOCK_API) {
      const response = await mockAuthService.register(userData);
      let user = response.user;
      if (user && Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        user = { ...user, roles: user.roles.map((r) => r.nombre) };
      }
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      return { ...response, user };
    }

    try {
      const response = await apiClient.post("/auth/register", userData);
      let { access_token, refresh_token, user } = response.data;
      if (user && Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        user = { ...user, roles: user.roles.map((r) => r.nombre) };
      }
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      return { ...response.data, user };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Inicio de sesión
  login: async (credentials) => {
    if (USE_MOCK_API) {
      const response = await mockAuthService.login(credentials);
      // Transformar roles si es necesario
      let user = response.user;
      if (user && Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        user = { ...user, roles: user.roles.map((r) => r.nombre) };
      }
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      return { ...response, user };
    }

    try {
      const response = await apiClient.post("/auth/login", credentials);
      let { access_token, refresh_token, user } = response.data;
      // Transformar roles si es necesario
      if (user && Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        user = { ...user, roles: user.roles.map((r) => r.nombre) };
      }
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      return { ...response.data, user };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cerrar sesión
  logout: () => {
    // Para JWT, solo necesitamos limpiar el localStorage
    // No es necesario hacer petición al backend
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Refrescar token
  refreshToken: async () => {
    if (USE_MOCK_API) {
      const response = await mockAuthService.refreshToken();
      localStorage.setItem("authToken", response.access_token);
      return response;
    }

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await apiClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      localStorage.setItem("authToken", access_token);

      return response.data;
    } catch (error) {
      // Si no se puede refrescar, cerrar sesión
      authService.logout();
      throw error.response?.data || error.message;
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    if (USE_MOCK_API) {
      return await mockAuthService.getProfile();
    }

    try {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Verificar rol del usuario (acepta mayúsculas/minúsculas y ROLE_)
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    const normalize = (r) =>
      r
        ?.toString()
        .replace(/^ROLE_/i, "")
        .toUpperCase();
    const target = normalize(role);
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((r) => normalize(r) === target);
    }
    if (user.rol && typeof user.rol === "string") {
      return normalize(user.rol) === target;
    }
    return false;
  },
};

export default authService;
