// Mock de servicio de autenticación para desarrollo sin backend
export const mockAuthService = {
  // Registro de usuario mock
  register: async (userData) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = {
      id: 1,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      rol: "AUTOR",
    };

    const mockResponse = {
      access_token: "mock_jwt_token_" + Date.now(),
      refresh_token: "mock_refresh_token_" + Date.now(),
      user: mockUser,
    };

    return mockResponse;
  },

  // Inicio de sesión mock
  login: async (credentials) => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verificar credenciales de demo
    const demoAccounts = {
      "autor@demo.com": { rol: "AUTOR", nombre: "Juan", apellido: "Pérez" },
      "revisor@demo.com": { rol: "REVISOR", nombre: "María", apellido: "García" },
      "editor@demo.com": { rol: "EDITOR", nombre: "Carlos", apellido: "López" },
    };

    const account = demoAccounts[credentials.email];

    if (!account || credentials.password !== "demo123") {
      throw new Error("Credenciales inválidas");
    }

    const mockUser = {
      id: Math.floor(Math.random() * 1000),
      email: credentials.email,
      nombre: account.nombre,
      apellido: account.apellido,
      rol: account.rol,
    };

    const mockResponse = {
      access_token: "mock_jwt_token_" + Date.now(),
      refresh_token: "mock_refresh_token_" + Date.now(),
      user: mockUser,
    };

    return mockResponse;
  },

  // Logout mock
  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: "Sesión cerrada exitosamente" };
  },

  // Refresh token mock
  refreshToken: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      access_token: "mock_jwt_token_refreshed_" + Date.now(),
      refresh_token: "mock_refresh_token_refreshed_" + Date.now(),
    };
  },

  // Obtener perfil mock
  getProfile: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return { user };
  },
};
