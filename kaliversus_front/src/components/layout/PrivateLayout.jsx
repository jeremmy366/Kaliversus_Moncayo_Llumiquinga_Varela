import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, ChartBarIcon, PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const PrivateLayout = ({ children }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera (robusto)
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userNavigation = [
    ...(hasRole("ROLE_AUTOR")
      ? [
          { name: "Mis Publicaciones", href: "/mis-publicaciones", icon: DocumentTextIcon },
          { name: "Nueva Publicación", href: "/nueva-publicacion", icon: PlusIcon },
        ]
      : []),
    { name: "Perfil", href: "/perfil", icon: UserCircleIcon },
    { name: "Configuración", href: "/configuracion", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header privado con menú de usuario */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-end">
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          >
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user?.nombres?.charAt(0)?.toUpperCase()}</span>
            </div>
            <span className="hidden md:block text-sm font-medium">{user?.nombres}</span>
          </button>

          {/* Menú desplegable del usuario */}
          {isUserMenuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="text-xs text-gray-500 truncate" title={user?.email}>
                  {user?.email}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1 capitalize">{user?.rol?.toLowerCase()}</p>
              </div>

              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  onClick={(e) => {
                    setIsUserMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default PrivateLayout;
