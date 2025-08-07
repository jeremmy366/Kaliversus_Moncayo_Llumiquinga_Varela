import { useState, useEffect } from "react";

/**
 * Hook personalizado para manejar estados de carga async
 * @param {Function} asyncFunction - Función asíncrona a ejecutar
 * @param {Array} dependencies - Dependencias para re-ejecutar (opcional)
 * @returns {Object} - Estado con data, loading, error y refetch
 */
export const useAsync = (asyncFunction, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return {
    ...state,
    refetch: execute,
  };
};
