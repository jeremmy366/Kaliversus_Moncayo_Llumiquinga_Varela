import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import {
  BuildingOffice2Icon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const InstitucionesPage = () => {
  const navigate = useNavigate();

  // Función para manejar navegación con scroll automático
  const handleNavigation = (href) => {
    navigate(href);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };
  const features = [
    {
      icon: ChartBarIcon,
      title: "Dashboard Institucional",
      description: "Panel de control completo con métricas y estadísticas de todas las publicaciones de tu institución.",
    },
    {
      icon: UserGroupIcon,
      title: "Gestión de Usuarios",
      description: "Administra autores, revisores y editores asociados a tu institución con roles personalizados.",
    },
    {
      icon: DocumentCheckIcon,
      title: "Control de Calidad",
      description: "Supervisa el proceso de revisión y aprobación de publicaciones institucionales.",
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Reportes Avanzados",
      description: "Genera reportes detallados sobre productividad académica y impacto de las publicaciones.",
    },
    {
      icon: CogIcon,
      title: "Configuración Personalizada",
      description: "Personaliza flujos de trabajo, plantillas y políticas específicas de tu institución.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Seguridad y Compliance",
      description: "Cumple con estándares internacionales de seguridad y políticas de acceso abierto.",
    },
  ];

  const plans = [
    {
      name: "Básico",
      price: "Gratis",
      description: "Perfecto para instituciones pequeñas",
      features: ["Hasta 50 publicaciones/mes", "3 usuarios administrativos", "Reportes básicos", "Soporte por email"],
      popular: false,
    },
    {
      name: "Profesional",
      price: "$49/mes",
      description: "Ideal para universidades medianas",
      features: ["Publicaciones ilimitadas", "15 usuarios administrativos", "Reportes avanzados", "API personalizada", "Soporte prioritario", "Branding personalizado"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Desde $149/mes",
      description: "Para grandes instituciones",
      features: ["Todo lo del plan Profesional", "Usuarios ilimitados", "Integración con sistemas existentes", "Soporte 24/7", "Consultoría especializada", "SLA garantizado"],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Soluciones para
              <span className="block text-blue-200">Instituciones Académicas</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Potencia la gestión editorial y académica de tu institución con herramientas especializadas y análisis avanzados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => handleNavigation("/contacto")}>
                Solicitar Demo
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-700"
                onClick={() => handleNavigation("/catalogo")}
              >
                Ver Catálogo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Herramientas Especializadas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Todo lo que necesitas para gestionar eficientemente las publicaciones académicas de tu institución.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
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

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planes Institucionales</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Selecciona el plan que mejor se adapte a las necesidades de tu institución.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative h-full ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Más Popular</span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 my-4">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register?role=admin">
                    <Button className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`} variant={plan.popular ? "default" : "outline"}>
                      {plan.price.includes("Desde") ? "Registrarse" : "Comenzar Prueba"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Transformar tu Institución?</h2>
          <p className="text-xl text-blue-100 mb-8">Únete a las instituciones líderes que ya confían en Kaliversus para gestionar sus publicaciones académicas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=admin">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Solicitar Demo Personalizada
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-700"
              onClick={() => handleNavigation("/contacto")}
            >
              Contáctanos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstitucionesPage;
