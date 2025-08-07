import React from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";

const LoadingSpinner = ({ size = "default", text = "Cargando..." }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
        <BookOpenIcon className={`absolute inset-0 m-auto text-primary-400 ${sizeClasses[size]}`} />
      </div>
      {text && <p className="mt-4 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
