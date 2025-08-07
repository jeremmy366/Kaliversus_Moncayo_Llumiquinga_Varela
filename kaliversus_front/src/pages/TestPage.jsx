import React from "react";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Kaliversus funciona! 🎉</h1>
        <p className="text-gray-600 mb-4">La aplicación está configurada correctamente.</p>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">✅ React está funcionando</div>
          <div className="text-sm text-gray-500">✅ Tailwind CSS está cargado</div>
          <div className="text-sm text-gray-500">✅ Vite está sirviendo la aplicación</div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
