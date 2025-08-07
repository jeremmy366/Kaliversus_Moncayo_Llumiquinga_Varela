import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CatalogoPage from "../CatalogoPage";

import { BookOpenIcon, MagnifyingGlassIcon, EyeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { publicationService } from "../../services/publicationService";

const LectorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Estado para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);

  const handleShowDetails = (pub) => {
    setSelectedPublication(pub);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPublication(null);
  };
  useEffect(() => {
    console.log("[LectorDashboard] user:", user);
  }, [user]);

  // Estado para mostrar el catálogo embebido y el tipo de filtro
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogType, setCatalogType] = useState(null); // null, "ARTICULO", "LIBRO"
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await publicationService.getPublications({ limit: 3 });
        setFeaturedPublications(data.publications || []);
      } catch (err) {
        setError("Error al cargar publicaciones destacadas");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [errorRecent, setErrorRecent] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      try {
        // Si tienes un endpoint específico para "visto recientemente", úsalo aquí.
        // Si no, mostramos las últimas publicaciones públicas como ejemplo.
        const data = await publicationService.getPublications({ limit: 3, sort: "recent" });
        setRecentlyViewed(data.publications || []);
      } catch (err) {
        setErrorRecent("Error al cargar publicaciones vistas recientemente");
      } finally {
        setIsLoadingRecent(false);
      }
    };
    fetchRecent();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido al Catálogo Académico</h1>
        <p className="text-gray-600 mt-2">{user ? `Hola, ${user?.nombres} ${user?.apellidos}` : "Explora nuestra colección de publicaciones académicas"}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Explorar Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                type="button"
                className="w-full flex items-center space-x-2 justify-center"
                onClick={() => {
                  setCatalogType(null);
                  setShowCatalog(true);
                }}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Ver Catálogo Completo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center space-x-2 justify-center"
                onClick={() => {
                  setCatalogType("ARTICULO");
                  setShowCatalog(true);
                }}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Explorar Artículos</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center space-x-2 justify-center"
                onClick={() => {
                  setCatalogType("LIBRO");
                  setShowCatalog(true);
                }}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Explorar Libros</span>
              </Button>
              {/* Modal de Catálogo embebido */}
              {showCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto p-4">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl font-bold"
                      onClick={() => setShowCatalog(false)}
                      aria-label="Cerrar catálogo"
                    >
                      &times;
                    </button>
                    <div className="pt-2">
                      <CatalogoPage initialType={catalogType} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Publications */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Publicaciones Destacadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando publicaciones...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : featuredPublications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay publicaciones destacadas.</div>
              ) : (
                featuredPublications.map((pub) => (
                  <div key={pub.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pub.tipo === "ARTICULO" ? "text-blue-600 bg-blue-100" : "text-green-600 bg-green-100"
                        }`}
                      >
                        {pub.tipo}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        <span className="text-sm">{pub.vistas ?? "-"}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{pub.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3">{pub.autorPrincipal ? `${pub.autorPrincipal.nombres} ${pub.autorPrincipal.apellidos}` : pub.autor || ""}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{pub.resumen}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{pub.fechaPublicacion || pub.fechaCreacion || ""}</span>
                      <Button size="sm" variant="outline" onClick={() => handleShowDetails(pub)}>
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Modal de detalles de publicación destacada */}
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
                    {selectedPublication.tipo === "ARTICULO" ? <BookOpenIcon className="h-6 w-6 text-blue-600" /> : <BookOpenIcon className="h-6 w-6 text-green-600" />}
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
                    <UserCircleIcon className="h-4 w-4" />
                    <span>
                      {selectedPublication.autorPrincipal
                        ? `${selectedPublication.autorPrincipal.nombres} ${selectedPublication.autorPrincipal.apellidos}`
                        : selectedPublication.autor || ""}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                    <span>{selectedPublication.fechaPublicacion || selectedPublication.fechaCreacion || ""}</span>
                  </div>
                  {selectedPublication.palabrasClave && selectedPublication.palabrasClave.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selectedPublication.palabrasClave.map((palabra, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {palabra}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={handleCloseModal}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Viewed (solo si el usuario está autenticado) */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCircleIcon className="h-5 w-5" />
              <span>Visto Recientemente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingRecent ? (
                <div className="text-center py-8 text-gray-500">Cargando publicaciones...</div>
              ) : errorRecent ? (
                <div className="text-center py-8 text-red-500">{errorRecent}</div>
              ) : recentlyViewed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No has visto ninguna publicación recientemente.</p>
                  <Link to="/catalogo" className="text-blue-600 hover:text-blue-700 font-medium">
                    Explorar el catálogo
                  </Link>
                </div>
              ) : (
                recentlyViewed.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.titulo}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {item.autorPrincipal ? `${item.autorPrincipal.nombres} ${item.autorPrincipal.apellidos}` : item.autor || ""}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.tipo === "ARTICULO" ? "text-blue-600 bg-blue-100" : "text-green-600 bg-green-100"
                          }`}
                        >
                          {item.tipo}
                        </span>
                        <span className="text-xs text-gray-500">{item.fechaVista || item.fechaPublicacion || item.fechaCreacion || ""}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleShowDetails(item)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LectorDashboard;
