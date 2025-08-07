import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon, ClockIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const ContactoPage = () => {
  const navigate = useNavigate();

  // Función para manejar navegación con scroll automático
  const handleNavigation = (href) => {
    navigate(href);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };
  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: "Email",
      description: "Respuesta en 24 horas",
      contact: "contacto@kaliversus.ec",
      action: "mailto:contacto@kaliversus.ec",
    },
    {
      icon: PhoneIcon,
      title: "Teléfono",
      description: "Lun - Vie, 9:00 - 18:00",
      contact: "+593 2 123-4567",
      action: "tel:+59321234567",
    },
    {
      icon: MapPinIcon,
      title: "Dirección",
      description: "Oficina principal",
      contact: "Av. República del Salvador, Quito, Ecuador",
      action: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contáctanos</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo de especialistas.</p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Múltiples Formas de Contacto</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Elige la opción que mejor se adapte a tus necesidades. Nuestro equipo está listo para ayudarte.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300 text-center">
                <CardHeader>
                  <method.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {method.action ? (
                    <a href={method.action} className="text-blue-600 hover:text-blue-700 font-medium">
                      {method.contact}
                    </a>
                  ) : (
                    <span className="text-gray-600">{method.contact}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas ayuda específica?</h3>
              <p className="text-gray-600 mb-6">Selecciona la opción que mejor describa tu consulta</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/register?role=admin">
                  <Button variant="outline" className="w-full">
                    Demo Institucional
                  </Button>
                </Link>
                <Link to="/register?role=autor">
                  <Button variant="outline" className="w-full">
                    Consulta de Autor
                  </Button>
                </Link>
                <button onClick={() => handleNavigation("/ayuda")}>
                  <Button variant="outline" className="w-full">
                    Soporte Técnico
                  </Button>
                </button>
                <Link to="/register">
                  <Button className="w-full">Crear Cuenta</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ClockIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Horarios de Atención</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte General</h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Lunes - Viernes:</strong> 9:00 - 18:00
                </p>
                <p>
                  <strong>Sábados:</strong> 9:00 - 13:00
                </p>
                <p>
                  <strong>Domingos:</strong> Cerrado
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte Técnico</h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>24/7:</strong> Para clientes Enterprise
                </p>
                <p>
                  <strong>Lunes - Viernes:</strong> 8:00 - 20:00
                </p>
                <p>
                  <strong>Emergencias:</strong> Disponible siempre
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.history.back()} className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver atrás
            </button>
            <Link to="/">
              <Button variant="outline">Ir al Inicio</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactoPage;
