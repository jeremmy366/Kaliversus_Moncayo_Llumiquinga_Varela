import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicationService } from "../../services/publicationService";
import { Button } from "../../components/ui/Button";

const CreatePublication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    resumen: "",
    palabrasClave: "",
    tipo: "ARTICULO",
    metadatos: { doi: "", pages: "" },
    coautoresIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    if (e.target.name.startsWith("metadatos.")) {
      const key = e.target.name.split(".")[1];
      setForm({ ...form, metadatos: { ...form.metadatos, [key]: e.target.value } });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        titulo: form.titulo,
        resumen: form.resumen,
        palabrasClave: form.palabrasClave.split(",").map((w) => w.trim()),
        tipo: form.tipo,
        metadatos: {
          doi: `10.1000/${Math.floor(Math.random() * 100000)}`,
          pages: Number(form.metadatos.pages) || 0,
        },
        coautoresIds: form.coautoresIds,
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
          <label className="block font-medium">Palabras clave (separadas por coma)</label>
          <input type="text" name="palabrasClave" value={form.palabrasClave} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="ARTICULO">ARTICULO</option>
            <option value="REPORTE">REPORTE</option>
            <option value="TESIS">TESIS</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Páginas</label>
          <input type="number" name="metadatos.pages" value={form.metadatos.pages} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
