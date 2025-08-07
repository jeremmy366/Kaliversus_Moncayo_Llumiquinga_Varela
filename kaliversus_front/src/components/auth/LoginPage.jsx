import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { EyeIcon, EyeSlashIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      toast.success("¡Bienvenido de vuelta!");
      // Redirigir al dashboard después de login
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <BookOpenIcon className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kaliversus</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h2>
            <p className="text-gray-600">Bienvenido de vuelta a tu espacio académico</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Accede a tu cuenta</CardTitle>
              <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Correo electrónico" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Tu contraseña" required />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
                    Iniciar sesión
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/")} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image/Graphics */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12">
        <div className="max-w-md text-center">
          <BookOpenIcon className="h-24 w-24 mx-auto mb-8 text-blue-200" />
          <h3 className="text-3xl font-bold mb-4">Gestión Académica Inteligente</h3>
          <p className="text-lg text-blue-100 mb-8">Accede a herramientas avanzadas para la publicación y revisión de contenido académico con la más alta calidad.</p>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Proceso de revisión transparente</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Control de versiones avanzado</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Catálogo de acceso global</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
