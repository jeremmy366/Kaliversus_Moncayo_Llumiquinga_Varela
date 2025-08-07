import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicationService } from "../../services/publicationService";
import { Button } from "../../components/ui/Button";

const CreatePublication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    resumen: "",
    contenido: "",
    categoria: "",
    palabrasClave: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        ...form,
        palabrasClave: form.palabrasClave.split(",").map((w) => w.trim()),
      };
      await publicationService.createPublication(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al crear publicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Nueva Publicación</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Título</label>
          <input type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Resumen</label>
          <textarea name="resumen" value={form.resumen} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Contenido</label>
          <textarea name="contenido" value={form.contenido} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Categoría</label>
          <input type="text" name="categoria" value={form.categoria} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Palabras clave (separadas por coma)</label>
          <input type="text" name="palabrasClave" value={form.palabrasClave} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Publicación"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
          Cancelar
        </Button>
      </form>
    </div>
  );
};

export default CreatePublication;
