import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { publicCatalogService } from "../services/publicCatalogService";
import {
  BookOpenIcon,
  DocumentTextIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(true);
  const navigate = useNavigate();

  // Cargar publicaciones destacadas al montar el componente
  useEffect(() => {
    const loadFeaturedPublications = async () => {
      try {
        const response = await publicCatalogService.getPublications({ limit: 3 });
        setFeaturedPublications(response.publications || []);
      } catch (error) {
        console.error("Error cargando publicaciones destacadas:", error);
      } finally {
        setIsLoadingPublications(false);
      }
    };

    loadFeaturedPublications();
  }, []);

  // Función para manejar clics en las tarjetas de beneficios
  const handleBenefitClick = (benefit) => {
    if (benefit.action === "catalog") {
      // Para lectores: ir al catálogo y hacer scroll hacia arriba
      navigate("/catalogo");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } else {
      // Para otros casos, navegación normal
      navigate(benefit.link);
    }
  };
  const features = [
    {
      icon: BookOpenIcon,
      title: "Catálogo Académico",
      description: "Accede a una amplia colección de artículos científicos y libros académicos revisados por pares.",
    },
    {
      icon: DocumentTextIcon,
      title: "Publicación Simplificada",
      description: "Proceso estructurado para autores con flujo de revisión editorial y control de versiones.",
    },
    {
      icon: UserGroupIcon,
      title: "Revisión Colaborativa",
      description: "Sistema de revisión por pares con comentarios estructurados y seguimiento en tiempo real.",
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Búsqueda Avanzada",
      description: "Encuentra contenido relevante con filtros por categoría, autor, palabras clave y más.",
    },
    {
      icon: CheckCircleIcon,
      title: "Calidad Garantizada",
      description: "Todas las publicaciones pasan por un riguroso proceso de revisión editorial.",
    },
    {
      icon: GlobeAltIcon,
      title: "Acceso Global",
      description: "Plataforma accesible desde cualquier lugar con contenido disponible 24/7.",
    },
  ];

  const benefits = [
    {
      icon: AcademicCapIcon,
      title: "Para Autores",
      description: "Publica tus investigaciones con visibilidad global y proceso de revisión transparente.",
      link: "/register?role=autor",
    },
    {
      icon: BookOpenIcon,
      title: "Para Lectores",
      description: "Explora contenido académico de alta calidad con acceso inmediato.",
      link: "/catalogo",
      action: "catalog",
    },
    {
      icon: LockClosedIcon,
      title: "Para Instituciones",
      description: "Gestiona las publicaciones de tu institución con herramientas especializadas.",
      link: "/instituciones",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Publicaciones" },
    { number: "2,500+", label: "Autores" },
    { number: "50+", label: "Instituciones" },
    { number: "95%", label: "Satisfacción" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Plataforma Académica
              <span className="block text-primary-200">de Vanguardia</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto animate-slide-up">
              Gestiona el ciclo completo de publicaciones académicas y editoriales con tecnología de microservicios distribuidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <div onClick={() => handleBenefitClick({ link: "/catalogo", action: "catalog" })}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto cursor-pointer">
                  Explorar Catálogo
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-700">
                  Comenzar a Publicar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Características Principales</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Una plataforma completa diseñada para satisfacer todas las necesidades del ecosistema académico.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Diseñado Para Todos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Sin importar tu rol en el ecosistema académico, Kaliversus tiene las herramientas que necesitas.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div onClick={() => handleBenefitClick(benefit)}>
                  <CardHeader className="text-center pb-4">
                    <benefit.icon className="h-16 w-16 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <CardTitle className="text-2xl group-hover:text-primary-600 transition-colors">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 mb-4">{benefit.description}</CardDescription>
                    <div className="flex items-center justify-center text-primary-600 font-medium group-hover:text-primary-700">
                      Saber más
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Publications Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Publicaciones Destacadas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Descubre las últimas investigaciones y publicaciones académicas disponibles en nuestra plataforma.</p>
          </div>

          {isLoadingPublications ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredPublications.map((pub) => (
                <Card key={pub.id} className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${pub.tipo === "ARTICULO" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {pub.tipo === "ARTICULO" ? "Artículo" : "Libro"}
                      </span>
                      {pub.tipo === "ARTICULO" ? <DocumentTextIcon className="h-5 w-5 text-gray-400" /> : <BookOpenIcon className="h-5 w-5 text-gray-400" />}
                    </div>
                    <CardTitle className="text-lg mb-2 line-clamp-2">{pub.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">{pub.resumen}</CardDescription>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>
                          {pub.autorPrincipal
                            ? typeof pub.autorPrincipal === "object"
                              ? pub.autorPrincipal.nombres || pub.autorPrincipal.apellidos
                                ? `${pub.autorPrincipal.nombres || ""} ${pub.autorPrincipal.apellidos || ""}`.trim()
                                : pub.autorPrincipal.email || pub.autorPrincipal.id || "-"
                              : pub.autorPrincipal
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                        <span>{pub.fechaPublicacion}</span>
                      </div>
                    </div>
                    {pub.palabrasClave && pub.palabrasClave.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {pub.palabrasClave.slice(0, 3).map((palabra, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {palabra}
                          </span>
                        ))}
                        {pub.palabrasClave.length > 3 && <span className="px-2 py-1 text-xs text-gray-500">+{pub.palabrasClave.length - 3}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <div onClick={() => handleBenefitClick({ link: "/catalogo", action: "catalog" })}>
              <Button size="lg" className="inline-flex items-center cursor-pointer">
                Ver Catálogo Completo
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Transformar tu Experiencia Académica?</h2>
          <p className="text-xl text-primary-100 mb-8">Únete a miles de académicos que ya confían en Kaliversus para gestionar sus publicaciones.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Crear Cuenta Gratis
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-700">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
