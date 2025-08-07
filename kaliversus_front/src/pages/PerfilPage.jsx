import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { UserCircleIcon, EnvelopeIcon, BuildingOffice2Icon, IdentificationIcon } from "@heroicons/react/24/outline";

const PerfilPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-xl mx-auto p-8 mt-8">Cargando perfil...</div>;
  if (error) return <div className="max-w-xl mx-auto p-8 mt-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 flex flex-col items-center">
      <div className="flex flex-col items-center mb-6">
        {profile?.fotoUrl && profile.fotoUrl !== "string" ? (
          <img src={profile.fotoUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow mb-2" />
        ) : (
          <UserCircleIcon className="w-28 h-28 text-blue-300 mb-2" />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {profile?.nombres} {profile?.apellidos}
        </h1>
        <div className="flex items-center text-gray-500 text-sm mb-1">
          <EnvelopeIcon className="w-5 h-5 mr-1" />
          {profile?.email}
        </div>
        <div className="flex items-center text-gray-500 text-sm mb-1">
          <BuildingOffice2Icon className="w-5 h-5 mr-1" />
          {profile?.afiliacion}
        </div>
        {profile?.orcid && profile.orcid !== "0000-0000-0000-0000" && (
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <IdentificationIcon className="w-5 h-5 mr-1" />
            <span>ORCID: {profile.orcid}</span>
          </div>
        )}
      </div>
      <div className="w-full border-t border-gray-200 my-4" />
      <div className="w-full flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Roles</div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile?.roles) && profile.roles.length > 0 ? (
              profile.roles.map((r, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {typeof r === "string" ? r.replace(/^ROLE_/, "").toLowerCase() : r.nombre?.replace(/^ROLE_/, "").toLowerCase()}
                </span>
              ))
            ) : (
              <span className="text-gray-400">Sin rol</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Miembro desde</div>
          <div className="text-gray-700 text-sm">{profile?.fechaCreacion ? new Date(profile.fechaCreacion).toLocaleDateString() : "-"}</div>
        </div>
      </div>
      {profile?.biografia && profile.biografia !== "string" && (
        <div className="w-full mt-6">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Biografía</div>
          <div className="text-gray-700 text-sm whitespace-pre-line">{profile.biografia}</div>
        </div>
      )}
      <Link to="/dashboard" className="w-full flex justify-center mt-8">
        <Button className="w-full md:w-auto" variant="outline">
          Volver al Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default PerfilPage;
