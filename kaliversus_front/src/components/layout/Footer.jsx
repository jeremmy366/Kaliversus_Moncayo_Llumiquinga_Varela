import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpenIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Función para manejar navegación con scroll automático
  const handleNavigation = (href) => {
    navigate(href);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const footerLinks = {
    platform: [
      { name: "Catálogo", href: "/catalogo" },
      { name: "Artículos", href: "/catalogo?tipo=ARTICULO" },
      { name: "Libros", href: "/catalogo?tipo=LIBRO" },
      { name: "Instituciones", href: "/instituciones" },
    ],
    support: [
      { name: "Centro de ayuda", href: "/ayuda" },
      { name: "Términos de uso", href: "/terminos" },
      { name: "Política de privacidad", href: "/privacidad" },
      { name: "Contacto", href: "/contacto" },
    ],
    community: [
      { name: "Blog", href: "/blog" },
      { name: "Eventos", href: "/eventos" },
      { name: "Newsletter", href: "/newsletter" },
      { name: "Para instituciones", href: "/instituciones" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpenIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Kaliversus</span>
            </div>
            <p className="text-gray-300 mb-4">Plataforma académica para la gestión y publicación de artículos científicos y libros académicos.</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>contacto@kaliversus.ec</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+593 2 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>Av. República del Salvador, Quito, Ecuador</span>
              </div>
            </div>
          </div>

          {/* Enlaces de la plataforma */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <button onClick={() => handleNavigation(link.href)} className="text-gray-300 hover:text-white transition-colors duration-200 text-left">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces de soporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button onClick={() => handleNavigation(link.href)} className="text-gray-300 hover:text-white transition-colors duration-200 text-left">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces de comunidad */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Comunidad</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <button onClick={() => handleNavigation(link.href)} className="text-gray-300 hover:text-white transition-colors duration-200 text-left">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter suscripción */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2">Mantente actualizado</h3>
              <p className="text-gray-300">Recibe notificaciones sobre nuevas publicaciones y actualizaciones.</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-grow lg:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg font-medium transition-colors duration-200">Suscribirse</button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} Kaliversus. Todos los derechos reservados.</p>
          <p className="mt-1 text-sm">Desarrollado en Ecuador para la gestión académica y editorial de alto nivel.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
