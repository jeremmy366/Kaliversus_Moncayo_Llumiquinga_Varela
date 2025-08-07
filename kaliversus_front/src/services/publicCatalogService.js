import publicApiClient from "./publicApiClient";

export const publicCatalogService = {
  // Obtener publicaciones públicas (sin autenticación)
  getPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.tipo) queryParams.append("tipo", params.tipo);
      if (params.search) queryParams.append("search", params.search);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Solo mostrar publicaciones públicas/publicadas
      queryParams.append("estado", "PUBLICADO");

      // USAR RUTA PÚBLICA CORRECTA SEGÚN DOCUMENTACIÓN
      const response = await publicApiClient.get(`/catalog?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      // Si no existe el endpoint público, intentar con el endpoint normal
      if (error.response?.status === 404) {
        try {
          const queryParams = new URLSearchParams();
          if (params.tipo) queryParams.append("tipo", params.tipo);
          if (params.search) queryParams.append("search", params.search);
          if (params.page) queryParams.append("page", params.page);
          if (params.limit) queryParams.append("limit", params.limit);
          queryParams.append("estado", "PUBLICADO");

          const response = await publicApiClient.get(`/publications?${queryParams.toString()}`);
          return response.data;
        } catch (fallbackError) {
          // Si tampoco funciona, usar datos de ejemplo
          console.warn("No se pudo conectar con la API, usando datos de ejemplo:", fallbackError);
          if (typeof publicCatalogService.getMockPublications === "function") {
            return publicCatalogService.getMockPublications(params);
          }
          return [];
        }
      }

      // Si es otro error, usar datos de ejemplo
      console.warn("Error en API pública, usando datos de ejemplo:", error);
      if (typeof publicCatalogService.getMockPublications === "function") {
        return publicCatalogService.getMockPublications(params);
      }
      return [];
    }
  },

  // Datos de ejemplo para cuando no hay conectividad con el backend
  getMockPublications: (params = {}) => {
    const mockData = [
      {
        id: 1,
        titulo: "Inteligencia Artificial en la Educación Moderna",
        resumen:
          "Un análisis comprehensivo sobre cómo la inteligencia artificial está transformando los métodos educativos tradicionales y creando nuevas oportunidades de aprendizaje.",
        tipo: "ARTICULO",
        autorPrincipal: { nombres: "María", apellidos: "González" },
        fechaCreacion: "2024-01-15",
        palabrasClave: ["IA", "Educación", "Tecnología", "Aprendizaje"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Tecnología Educativa" },
      },
      {
        id: 2,
        titulo: "Fundamentos de Machine Learning",
        resumen: "Una guía completa para entender los conceptos básicos del aprendizaje automático, desde algoritmos supervisados hasta redes neuronales profundas.",
        tipo: "LIBRO",
        autorPrincipal: { nombres: "Carlos", apellidos: "Rodríguez" },
        fechaCreacion: "2024-02-10",
        palabrasClave: ["Machine Learning", "Algoritmos", "Datos", "Python"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Ciencias de la Computación" },
      },
      {
        id: 3,
        titulo: "Desarrollo Sostenible y Tecnología Verde",
        resumen: "Exploración de las tecnologías emergentes que contribuyen al desarrollo sostenible y la reducción del impacto ambiental.",
        tipo: "ARTICULO",
        autorPrincipal: { nombres: "Ana", apellidos: "Martínez" },
        fechaCreacion: "2024-03-05",
        palabrasClave: ["Sostenibilidad", "Tecnología Verde", "Medio Ambiente"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Medio Ambiente" },
      },
      {
        id: 4,
        titulo: "Programación Web con React y Node.js",
        resumen: "Manual práctico para el desarrollo de aplicaciones web modernas utilizando React en el frontend y Node.js en el backend.",
        tipo: "LIBRO",
        autorPrincipal: { nombres: "Luis", apellidos: "Fernández" },
        fechaCreacion: "2024-03-20",
        palabrasClave: ["React", "Node.js", "JavaScript", "Web Development"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Programación" },
      },
      {
        id: 5,
        titulo: "Ciberseguridad en la Era Digital",
        resumen: "Análisis de las principales amenazas de seguridad informática y estrategias de protección para individuos y organizaciones.",
        tipo: "ARTICULO",
        autorPrincipal: { nombres: "Roberto", apellidos: "Silva" },
        fechaCreacion: "2024-04-01",
        palabrasClave: ["Ciberseguridad", "Hacking", "Protección", "Digital"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Seguridad Informática" },
      },
      {
        id: 6,
        titulo: "Diseño UX/UI para Aplicaciones Móviles",
        resumen: "Principios y mejores prácticas para crear interfaces de usuario intuitivas y experiencias excepcionales en aplicaciones móviles.",
        tipo: "LIBRO",
        autorPrincipal: { nombres: "Isabella", apellidos: "Torres" },
        fechaCreacion: "2024-04-15",
        palabrasClave: ["UX", "UI", "Diseño", "Apps Móviles"],
        estado: "PUBLICADO",
        metadatos: { categoria: "Diseño" },
      },
    ];

    // Aplicar filtros
    let filteredData = mockData;

    if (params.tipo && params.tipo !== "TODOS") {
      filteredData = filteredData.filter((pub) => pub.tipo === params.tipo);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(
        (pub) =>
          pub.titulo.toLowerCase().includes(searchLower) ||
          pub.resumen.toLowerCase().includes(searchLower) ||
          pub.palabrasClave.some((palabra) => palabra.toLowerCase().includes(searchLower))
      );
    }

    return {
      publications: filteredData,
      total: filteredData.length,
      page: 1,
      totalPages: 1,
    };
  },
};

export default publicCatalogService;
