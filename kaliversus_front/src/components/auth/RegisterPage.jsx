import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { EyeIcon, EyeSlashIcon, BookOpenIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    afiliacion: "",
    orcid: "",
    biografia: "",
    role: "ROLE_AUTOR", // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: "ROLE_AUTOR", label: "Autor", description: "Crear y gestionar publicaciones académicas" },
    { value: "ROLE_REVISOR", label: "Revisor", description: "Evaluar y comentar publicaciones" },
    { value: "ROLE_EDITOR", label: "Editor", description: "Gestionar y editar publicaciones de otros autores" },
    { value: "ROLE_LECTOR", label: "Lector", description: "Acceder al catálogo de publicaciones" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { confirmPassword, role, ...registerData } = formData;
      await register({
        ...registerData,
        roles: [formData.role],
        fotoUrl: "", // Campo requerido por el backend
      });

      toast.success("¡Registro exitoso! Bienvenido a Kaliversus.");
      // Redirigir al dashboard después de registro
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Graphics */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-purple-600 to-primary-600 text-white p-12">
        <div className="max-w-md text-center">
          <BookOpenIcon className="h-24 w-24 mx-auto mb-8 text-purple-200" />
          <h3 className="text-3xl font-bold mb-4">Únete a la Comunidad Académica</h3>
          <p className="text-lg text-purple-100 mb-8">
            Forma parte de una plataforma diseñada por y para académicos, con las mejores herramientas para la publicación científica.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-200" />
              <span>Proceso de publicación simplificado</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-200" />
              <span>Revisión por pares de calidad</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-200" />
              <span>Visibilidad global de tu trabajo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <BookOpenIcon className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kaliversus</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
            <p className="text-gray-600">Únete a nuestra comunidad académica</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>Completa tus datos para crear tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Tus nombres" required />
                  <Input label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Tus apellidos" required />
                </div>

                {/* Email */}
                <Input label="Correo electrónico" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />

                {/* Contraseñas */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirma tu contraseña"
                        required
                      />
                      <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Información académica */}
                <Input label="Afiliación institucional" name="afiliacion" value={formData.afiliacion} onChange={handleChange} placeholder="Universidad, Institución, etc." />

                <Input label="ORCID (opcional)" name="orcid" value={formData.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Biografía breve (opcional)</label>
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleChange}
                    placeholder="Describe brevemente tu perfil académico..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">¿Cuál es tu rol principal?</label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="text-sm text-gray-600">
                    Acepto los{" "}
                    <Link to="/terminos" className="text-primary-600 hover:text-primary-700">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacidad" className="text-primary-600 hover:text-primary-700">
                      política de privacidad
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
                    Crear cuenta
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/")} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
