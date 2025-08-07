import React from "react";

const MyReviewsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Mis Revisiones Asignadas</h1>
      <Button onClick={() => navigate("/dashboard")} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
        Volver al Dashboard
      </Button>
      <p className="text-gray-600 mb-4">Aquí verás las revisiones que tienes asignadas como revisor.</p>
      {loading ? (
        <p>Cargando revisiones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reviews.length === 0 ? (
        <p>No tienes revisiones asignadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Publicación</th>
                <th className="px-4 py-2 border">Estado</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 border">{r.id}</td>
                  <td className="px-4 py-2 border">{r.publicacionTitulo || r.publicacionId || "-"}</td>
                  <td className="px-4 py-2 border">{r.estado || "-"}</td>
                  <td className="px-4 py-2 border">
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
