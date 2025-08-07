import AutorTemplates from "./pages/dashboards/AutorTemplates";
import AutorStats from "./pages/dashboards/AutorStats";
import CreatePublication from "./pages/publications/CreatePublication";
import EditPublication from "./pages/publications/EditPublication";
import PublicationDetail from "./pages/publications/PublicationDetail";
import PerfilPage from "./pages/PerfilPage";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import PrivateLayout from "./components/layout/PrivateLayout";
import RequireAuth from "./components/layout/RequireAuth";
import PublicOnly from "./components/layout/PublicOnly";
import HomePage from "./pages/HomePage";
import CatalogoPage from "./pages/CatalogoPage";
import InstitucionesPage from "./pages/InstitucionesPage";
import ContactoPage from "./pages/ContactoPage";
import EnConstruccionPage from "./pages/EnConstruccionPage";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPublications from "./pages/AdminPublications";
import MetricsPage from "./pages/MetricsPage";
import LogsPage from "./pages/LogsPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import ReviewsPage from "./pages/ReviewsPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import "./App.css";

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rutas de autenticación sin Layout */}
              <Route
                path="/login"
                element={
                  <PublicOnly>
                    <LoginPage />
                  </PublicOnly>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnly>
                    <RegisterPage />
                  </PublicOnly>
                }
              />
              {/* Rutas públicas con Layout (accesibles para todos) */}
              <Route
                path="/catalogo"
                element={
                  <Layout>
                    <CatalogoPage />
                  </Layout>
                }
              />
              <Route
                path="/*"
                element={
                  <PublicOnly>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/instituciones" element={<InstitucionesPage />} />
                        <Route path="/contacto" element={<ContactoPage />} />
                        {/* Páginas en construcción */}
                        <Route
                          path="/ayuda"
                          element={<EnConstruccionPage titulo="Centro de Ayuda" descripcion="Estamos preparando una completa base de conocimientos para ayudarte." />}
                        />
                        <Route
                          path="/terminos"
                          element={<EnConstruccionPage titulo="Términos de Uso" descripcion="Los términos y condiciones estarán disponibles próximamente." />}
                        />
                        <Route
                          path="/privacidad"
                          element={<EnConstruccionPage titulo="Política de Privacidad" descripcion="Nuestra política de privacidad está siendo actualizada." />}
                        />
                        <Route path="/blog" element={<EnConstruccionPage titulo="Blog" descripcion="Estamos preparando contenido académico interesante para ti." />} />
                        <Route path="/eventos" element={<EnConstruccionPage titulo="Eventos" descripcion="Pronto organizaremos webinars y conferencias académicas." />} />
                        <Route path="/newsletter" element={<EnConstruccionPage titulo="Newsletter" descripcion="El boletín informativo estará disponible próximamente." />} />
                        {/* Aquí agregaremos más rutas */}
                      </Routes>
                    </Layout>
                  </PublicOnly>
                }
              />
              {/* Ruta protegida para plantillas del autor */}
              <Route
                path="/autor/plantillas"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <AutorTemplates />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para estadísticas del autor */}
              <Route
                path="/autor/estadisticas"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <AutorStats />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Rutas protegidas para publicaciones (autor) */}
              <Route
                path="/publications/create"
                element={
                  <RequireAuth requiredRole="AUTOR">
                    <PrivateLayout>
                      <CreatePublication />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/publications/:id/edit"
                element={
                  <RequireAuth requiredRole="AUTOR">
                    <PrivateLayout>
                      <EditPublication />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/publications/:id"
                element={
                  <RequireAuth requiredRole="AUTOR">
                    <PrivateLayout>
                      <PublicationDetail />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/perfil"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <PerfilPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para configuración (cualquier usuario autenticado) */}
              <Route
                path="/configuracion"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <ConfiguracionPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Rutas privadas solo para autenticados, sin header público */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <Dashboard />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para gestión de usuarios (solo admin) */}
              <Route
                path="/admin/users"
                element={
                  <RequireAuth requiredRole="ADMIN">
                    <PrivateLayout>
                      <AdminUsers />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para gestión de publicaciones (solo admin) */}
              <Route
                path="/admin/publications"
                element={
                  <RequireAuth requiredRole="ADMIN">
                    <PrivateLayout>
                      <AdminPublications />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para métricas (solo admin) */}
              <Route
                path="/admin/metrics"
                element={
                  <RequireAuth requiredRole="ADMIN">
                    <PrivateLayout>
                      <MetricsPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para logs del sistema (solo admin) */}
              <Route
                path="/admin/logs"
                element={
                  <RequireAuth requiredRole="ADMIN">
                    <PrivateLayout>
                      <LogsPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para gestión de revisiones (solo editores/admins) */}
              <Route
                path="/admin/reviews"
                element={
                  <RequireAuth requiredRole="ADMIN">
                    <PrivateLayout>
                      <ReviewsPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para mis revisiones (revisores y admins) */}
              <Route
                path="/mis-revisiones"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <MyReviewsPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
              {/* Ruta protegida para notificaciones (cualquier usuario autenticado) */}
              <Route
                path="/notificaciones"
                element={
                  <RequireAuth>
                    <PrivateLayout>
                      <NotificationsPage />
                    </PrivateLayout>
                  </RequireAuth>
                }
              />
            </Routes>
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  style: {
                    background: "#22c55e",
                  },
                },
                error: {
                  style: {
                    background: "#ef4444",
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
