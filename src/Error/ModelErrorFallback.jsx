import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const ModelErrorFallback = ({ error, resetErrorBoundary }) => {
  console.error("Error loading 3D model:", error);
  return (
    <div>
      Errore nel caricamento del modello.
      <button onClick={resetErrorBoundary}>Riprova</button>
    </div>
  );
};

const ModelErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ModelErrorFallback}
      onReset={() => {
        // Logica se vuoi resettare lo stato, es: ricaricare il modello
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ModelErrorBoundary;
