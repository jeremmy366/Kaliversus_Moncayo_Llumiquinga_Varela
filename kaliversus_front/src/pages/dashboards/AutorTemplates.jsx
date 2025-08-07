import React from "react";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

const templates = [
  {
    nombre: "Artículo Científico",
    descripcion: "Plantilla base para artículos científicos (Word)",
    url: "/plantillas/articulo_cientifico.docx",
  },
  {
    nombre: "Ensayo Académico",
    descripcion: "Plantilla para ensayos académicos (Word)",
    url: "/plantillas/ensayo_academico.docx",
  },
  {
    nombre: "Presentación PPT",
    descripcion: "Plantilla para presentaciones académicas (PowerPoint)",
    url: "/plantillas/presentacion_academica.pptx",
  },
];

const AutorTemplates = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Plantillas para autores</h2>
      <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
        <b>¡Aviso!</b> Por ahora este apartado está en pruebas y no es posible descargar las plantillas.
      </div>
      <div className="space-y-4 mb-8">
        {templates.map((tpl) => (
          <div key={tpl.nombre} className="border rounded p-4 flex items-center justify-between opacity-60 cursor-not-allowed">
            <div>
              <div className="font-semibold">{tpl.nombre}</div>
              <div className="text-gray-500 text-sm">{tpl.descripcion}</div>
            </div>
            <Button disabled>Descargar</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        Volver al Dashboard
      </Button>
    </div>
  );
};

export default AutorTemplates;
