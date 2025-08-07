import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { publicCatalogService } from "../services/publicCatalogService";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  BookOpenIcon,
  UserIcon,
  CalendarDaysIcon,
  TagIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const CatalogoPage = () => {
  // Modal state for publication details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  // Open modal with publication details
  const handleShowDetails = (publicacion) => {
    console.log("handleShowDetails called", publicacion);
    setSelectedPublication(publicacion);
    setShowDetailModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPublication(null);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("TODOS");
  const [isLoading, setIsLoading] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [totalPublications, setTotalPublications] = useState(0);

  // Detectar tipo desde URL al cargar la página
  useEffect(() => {
    const tipoFromUrl = searchParams.get("tipo");
    if (tipoFromUrl) {
      setSelectedType(tipoFromUrl);
    }
  }, [searchParams]);

  // Función para cargar publicaciones de la API
  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedType !== "TODOS") {
        params.tipo = selectedType;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await publicCatalogService.getPublications(params);

      // Transformar los datos de la API al formato esperado por el frontend
      const transformedPublications =
        response.publications?.map((pub) => ({
          id: pub.id,
          titulo: pub.titulo,
          resumen: pub.resumen,
          tipo: pub.tipo,
          autorPrincipal: `${pub.autorPrincipal?.nombres} ${pub.autorPrincipal?.apellidos}`,
          fechaPublicacion: new Date(pub.fechaCreacion).toLocaleDateString("es-ES"),
          palabrasClave: pub.palabrasClave || [],
          estado: pub.estado,
          metadatos: pub.metadatos,
        })) || [];

      console.log("[CatalogoPage] response:", response);
      console.log("[CatalogoPage] transformedPublications:", transformedPublications);
      setPublicaciones(transformedPublications);
      setFilteredPublicaciones(transformedPublications);
      setTotalPublications(response.total || 0);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      // En caso de error, mostrar array vacío
      setPublicaciones([]);
      setFilteredPublicaciones([]);
      setTotalPublications(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar publicaciones al montar el componente
  useEffect(() => {
    fetchPublications();
  }, []);

  // Efecto para cargar publicaciones cuando cambie el tipo seleccionado
  useEffect(() => {
    if (selectedType) {
      fetchPublications();
    }
  }, [selectedType]);

  // Efecto para sincronizar el estado inicial con los parámetros de URL
  useEffect(() => {
    const queryParam = searchParams.get("q") || "";
    const tipoParam = searchParams.get("tipo") || "TODOS";

    setSearchQuery(queryParam);
    setSelectedType(tipoParam);

    // Solo cargar si los parámetros han cambiado
    if (queryParam !== searchQuery || tipoParam !== selectedType) {
      fetchPublications();
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Actualizar los parámetros de URL
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set("q", searchQuery);
    }
    if (selectedType !== "TODOS") {
      newParams.set("tipo", selectedType);
    }
    setSearchParams(newParams);

    // Volver a cargar desde la API con los nuevos filtros
    fetchPublications();
  };

  const handleTypeFilter = (tipo) => {
    setSelectedType(tipo);
    // Actualizar los parámetros de URL
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set("q", searchQuery);
    }
    if (tipo !== "TODOS") {
      newParams.set("tipo", tipo);
    }
    setSearchParams(newParams);

    // Volver a cargar desde la API con los nuevos filtros
    fetchPublications();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("TODOS");
    setSearchParams({});

    // Volver a cargar todas las publicaciones
    fetchPublications();
  };

  const typeFilters = [
    { value: "TODOS", label: "Todos", icon: null },
    { value: "ARTICULO", label: "Artículos", icon: DocumentTextIcon },
    { value: "LIBRO", label: "Libros", icon: BookOpenIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header del catálogo */}
      <div className="bg-gray-50 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Catálogo Académico</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explora nuestra colección de artículos científicos y libros académicos revisados por pares.</p>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por título, autor, palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Buscar
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Banner informativo de acceso público */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-center">
            <div className="flex items-center space-x-2 text-blue-800">
              <GlobeAltIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                🎉 Acceso libre y gratuito para todos los usuarios.
                <Link to="/register" className="ml-1 underline hover:text-blue-900">
                  Regístrate
                </Link>
                para acceder a funciones avanzadas.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Tipo de publicación</h3>
                    <div className="space-y-2">
                      {typeFilters.map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => handleTypeFilter(filter.value)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedType === filter.value ? "bg-primary-100 text-primary-700 border-primary-200" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {filter.icon && <filter.icon className="h-4 w-4" />}
                          <span>{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:w-3/4">
            {/* Resultados header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {totalPublications} {totalPublications === 1 ? "resultado encontrado" : "resultados encontrados"}
                </h2>
                {searchQuery && <p className="text-sm text-gray-600">para "{searchQuery}"</p>}
                {selectedType !== "TODOS" && <p className="text-xs text-blue-600">Filtrado por: {selectedType}</p>}
              </div>
              <select className="input-field w-auto">
                <option>Más recientes</option>
                <option>Más antiguos</option>
                <option>Alfabético A-Z</option>
                <option>Alfabético Z-A</option>
              </select>
            </div>

            {/* Lista de publicaciones */}
            {isLoading ? (
              <LoadingSpinner text="Cargando publicaciones..." />
            ) : (
              <div className="space-y-6">
                {filteredPublicaciones.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-600 mb-4">Intenta ajustar tus filtros o términos de búsqueda.</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedType("TODOS");
                          setSearchParams({});
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPublicaciones.map((publicacion) => (
                    <Card key={publicacion.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {publicacion.tipo === "ARTICULO" ? <DocumentTextIcon className="h-5 w-5 text-blue-600" /> : <BookOpenIcon className="h-5 w-5 text-green-600" />}
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  publicacion.tipo === "ARTICULO" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                }`}
                              >
                                {publicacion.tipo}
                              </span>
                            </div>
                            <CardTitle className="text-xl mb-2 hover:text-primary-600 cursor-pointer">{publicacion.titulo}</CardTitle>
                            <CardDescription className="text-gray-600 mb-4">{publicacion.resumen}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{publicacion.autorPrincipal}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{new Date(publicacion.fechaPublicacion).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {publicacion.palabrasClave.map((palabra, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {palabra}
                            </span>
                          ))}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log("Ver detalles clicked", publicacion);
                              handleShowDetails(publicacion);
                            }}
                          >
                            Ver detalles
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log("Leer ahora clicked", publicacion);
                              handleShowDetails(publicacion);
                            }}
                          >
                            Leer ahora
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            {/* Modal for publication details */}
            {showDetailModal && selectedPublication && (
              <div style={{ zIndex: 1000 }} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div style={{ zIndex: 1100 }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={handleCloseModal}
                    aria-label="Cerrar"
                    type="button"
                    autoFocus
                  >
                    ×
                  </button>
                  <div className="mb-4 flex items-center gap-2">
                    {selectedPublication.tipo === "ARTICULO" ? <DocumentTextIcon className="h-6 w-6 text-blue-600" /> : <BookOpenIcon className="h-6 w-6 text-green-600" />}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        selectedPublication.tipo === "ARTICULO" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedPublication.tipo}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPublication.titulo}</h2>
                  <div className="text-gray-600 mb-4">{selectedPublication.resumen}</div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                    <UserIcon className="h-4 w-4" />
                    <span>{selectedPublication.autorPrincipal}</span>
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>{selectedPublication.fechaPublicacion}</span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedPublication.palabrasClave.map((palabra, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {palabra}
                      </span>
                    ))}
                  </div>
                  {selectedPublication.metadatos && (
                    <div className="mb-4 text-sm text-gray-500">
                      <span className="font-medium">Categoría:</span> {selectedPublication.metadatos.categoria}
                    </div>
                  )}
                  {/* You can add more fields here if needed */}
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={handleCloseModal}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogoPage;
