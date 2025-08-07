import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { WrenchScrewdriverIcon, ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

const EnConstruccionPage = ({
  titulo = "Página en Construcción",
  descripcion = "Esta sección está siendo desarrollada y estará disponible pronto.",
  showBackButton = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <CardDescription className="text-gray-600 text-lg">{descripcion}</CardDescription>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">Mientras tanto, puedes:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/catalogo">
                <Button variant="outline" className="w-full sm:w-auto">
                  Explorar Catálogo
                </Button>
              </Link>
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Ir al Inicio
                </Button>
              </Link>
            </div>

            {showBackButton && (
              <div className="pt-2">
                <button onClick={() => window.history.back()} className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center mx-auto">
                  <ArrowLeftIcon className="mr-1 h-4 w-4" />
                  Volver atrás
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnConstruccionPage;
