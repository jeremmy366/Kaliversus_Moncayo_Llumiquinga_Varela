import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    userService
      .getUsers(page, limit)
      .then((res) => {
        console.log("[AdminUsers] Respuesta getUsers:", res);
        let arr = res.data.users || res.data.items || res.data;
        if (!Array.isArray(arr)) arr = [];
        setUsers(arr);
        setTotal(res.data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[AdminUsers] Error al cargar usuarios:", err);
        setError("Error al cargar usuarios");
        setLoading(false);
      });
  }, [page, limit]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
      } catch {
        alert("Error al eliminar usuario");
      }
    }
  };

  // Filtrado por búsqueda
  const filteredUsers = users.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.rol?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Volver al Dashboard
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar por nombre, email o rol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Rol</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border px-4 py-2">{`${user.nombres || ""} ${user.apellidos || ""}`.trim() || "Sin nombre"}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">
                    {user.rol
                      ? typeof user.rol === "object"
                        ? user.rol.nombre || JSON.stringify(user.rol)
                        : user.rol
                      : Array.isArray(user.roles) && user.roles.length > 0
                      ? user.roles.map((r) => r.nombre).join(", ")
                      : "Sin rol"}
                  </td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Editar</button>
                    <button onClick={() => handleDelete(user.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginación básica */}
          <div className="mt-4 flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">
              Anterior
            </button>
            <span>Página {page}</span>
            <button disabled={users.length < limit} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
