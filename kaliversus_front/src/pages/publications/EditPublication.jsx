import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicationService } from "../../services/publicationService";
import { Button } from "../../components/ui/Button";

const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    resumen: "",
    contenido: "",
    categoria: "",
    palabrasClave: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPub = async () => {
      setLoading(true);
      setError(null);
      try {
        const pub = await publicationService.getPublicationById(id);
        setForm({
          ...pub,
          palabrasClave: pub.palabrasClave ? pub.palabrasClave.join(", ") : "",
        });
      } catch (err) {
        setError("No se pudo cargar la publicación");
      } finally {
        setLoading(false);
      }
    };
    fetchPub();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Limpiar propiedades no permitidas
      const forbidden = [
        "id",
        "estado",
        "versionActual",
        "fechaCreacion",
        "fechaActualizacion",
        "autorPrincipal",
        "autorPrincipalId",
        "coautores",
        "revisiones",
        "contenido",
        "categoria",
      ];
      const data = {
        ...form,
        palabrasClave: form.palabrasClave.split(",").map((w) => w.trim()),
      };
      forbidden.forEach((key) => delete data[key]);
      await publicationService.updatePublication(id, data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al actualizar publicación");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-8">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Editar Publicación</h2>
        <Button type="button" onClick={() => navigate("/publications/create")} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          Agregar Publicación
        </Button>
      </div>
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
          <label className="block font-medium">Categoría</label>
          <input type="text" name="categoria" value={form.categoria} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">Palabras clave (separadas por coma)</label>
          <input type="text" name="palabrasClave" value={form.palabrasClave} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
          Cancelar
        </Button>
      </form>
    </div>
  );
};

export default EditPublication;
