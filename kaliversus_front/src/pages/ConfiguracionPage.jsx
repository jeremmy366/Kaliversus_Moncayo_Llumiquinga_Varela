import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

const CONFIG_KEY = "kaliversus_config";

const defaultConfig = {
  theme: "light",
  language: "es",
  notifications: true,
};

const ConfiguracionPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);

  // Cargar config de localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      try {
        setConfig({ ...defaultConfig, ...JSON.parse(stored) });
      } catch {
        setConfig(defaultConfig);
      }
    }
  }, []);

  // Guardar config en localStorage
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Cambiar tema (opcional: puedes conectar con context global)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", config.theme === "dark");
  }, [config.theme]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          Volver al Dashboard
        </Button>
      </div>
      <form onSubmit={handleSave} className="space-y-6 bg-white border rounded p-6 shadow">
        <div>
          <label className="block font-medium mb-1">Tema</label>
          <select className="w-full border rounded px-3 py-2" value={config.theme} onChange={(e) => setConfig((c) => ({ ...c, theme: e.target.value }))}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Idioma</label>
          <select className="w-full border rounded px-3 py-2" value={config.language} onChange={(e) => setConfig((c) => ({ ...c, language: e.target.value }))}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="notifications"
            type="checkbox"
            checked={config.notifications}
            onChange={(e) => setConfig((c) => ({ ...c, notifications: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="notifications" className="font-medium">
            Mostrar notificaciones locales
          </label>
        </div>
        <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
          Guardar Cambios
        </Button>
        {saved && <div className="text-green-600 font-semibold mt-2">¡Preferencias guardadas!</div>}
      </form>
    </div>
  );
};

export default ConfiguracionPage;
