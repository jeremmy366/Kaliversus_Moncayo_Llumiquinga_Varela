import api from "./api";

const statsService = {
  getSystemStats: async () => {
    // Llama a los endpoints de usuarios y publicaciones para obtener los totales
    const [usersRes, publicationsRes] = await Promise.all([api.get("/users?page=1&limit=1"), api.get("/publications?page=1&limit=1")]);
    return {
      totalUsuarios: usersRes.data.total || usersRes.data.count || 0,
      publicacionesTotales: publicationsRes.data.total || publicationsRes.data.count || 0,
      // Puedes agregar más estadísticas aquí si tu API lo permite
    };
  },
};

export default statsService;
