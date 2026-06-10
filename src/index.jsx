// Esempio: src/main.jsx o src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Il tuo componente App

// Trova la definizione del root
const root = ReactDOM.createRoot(document.getElementById('root'));

// ✅ CORREZIONE: Avvolgi la chiamata a root.render() in React.startTransition
// per forzare il comportamento concorrente e silenziare il warning.
React.startTransition(() => {
  root.render(
    <React.StrictMode>
      {/* Qui viene renderizzato il tuo componente App che contiene RouterProvider */}
      <App />
    </React.StrictMode>
  );
});

// A questo punto, puoi rimuovere la "future flag" da App.jsx
// poiché React.startTransition() ora avvolge l'intera app.
