import React, { useEffect, useState, useMemo } from "react";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

// Import Componenti UI
import AppBarr from "./Components/UI/AppBar";
import Footer from "./Components/UI/Footer";
import theme from './theme/theme';

// Import Pagine e Componenti Funzionali
import MyModelComponent from "./Components/MyModel";
import CollectionView from "./Components/CollectionView";
import SchedaReperto from "./Components/SchedaReperto";
import UploadReperto3D from "./Components/Upload/UploadReperto3d";
import Login from "./Components/Admin/Login";
import ProtectedRoute from "./Components/Admin/ProtectedRoute"; 
import Admin from "./Components/Admin/AdminDashboard"; 
import BulkUploadZip from "./Components/Upload/BulkUploadZip";
import RepertoImagesUploader from "./Components/Upload/RepertoImagesUploader"; 
import LandingPage from "./Components/LandingPage/LandingPage";

// Import Chiamate API
import { fetchSiporDataWithDebug } from "./ApiCall/ApiCall"; 

// =========================================================================
// 1. LAYOUT PRINCIPALE
// =========================================================================
function RootLayout({ setFiltro }) {
  const location = useLocation();
  const is3DView = location.pathname.includes("/modelli/");
  
  return (
    <>
      {!is3DView && <AppBarr onSearch={(val) => setFiltro(val)} />}
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
      {!is3DView && <Footer />}
    </>
  );
}

// =========================================================================
// 2. COMPONENTE APP
// =========================================================================
function App() {
  const [siporData, setSiporData] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSiporDataWithDebug()
      .then((result) => {
        setSiporData(result || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore nel caricamento dati:", error);
        setLoading(false);
      });
  }, []);

  const estraiValoreOggetto = (o, fieldName) => {
    if (!o) return null;
    switch (fieldName) {
      case 'sezione':
        return o.sezione || o.condizione_giuridica?.sezione || o.compilazione?.sezione;
      default:
        return o[fieldName];
    }
  };

  const filtrati = useMemo(() => {
    return siporData.filter((o) => {
      const codiceReperto = o.codice || ''; 
      return codiceReperto.toLowerCase().includes(filtro.toLowerCase());
    });
  }, [siporData, filtro]);

  const menuFiltri = useMemo(() => {
    const sezioni = new Set();
    const materie = new Set();
    const cronologie = new Set();
    const classi = new Set();

    siporData.forEach(o => {
      const sezioneVal = estraiValoreOggetto(o, 'sezione');
      if (sezioneVal) sezioni.add(sezioneVal);
      if (o.categoria_materiale) materie.add(o.categoria_materiale);
      if (o.riferimento_cronologico) cronologie.add(o.riferimento_cronologico);
      if (o.classe_produzione) classi.add(o.classe_produzione);
    });

    return {
      sezioni: Array.from(sezioni).sort(),
      materie: Array.from(materie).sort(),
      cronologie: Array.from(cronologie).sort(),
      classi: Array.from(classi).sort()
    };
  }, [siporData]);

  // --- ROUTER MEMOIZZATO (Non viene ricreato ad ogni render) ---
  const router = useMemo(() => createBrowserRouter(
    [
      {
        path: "/",
        element: <RootLayout setFiltro={setFiltro} />, 
        children: [
          { index: true, element: <LandingPage /> },
          {
            path: "wp10",
            element: (
              <CollectionView
                oggetti={filtrati}
                tutteLeSezioni={menuFiltri.sezioni}
                tutteLeMaterie={menuFiltri.materie}
                tutteLeCronologie={menuFiltri.cronologie}
                tutteLeClassi={menuFiltri.classi} 
                loading={loading}
              />
            ),
          },
          { path: "wp10/scheda/:codice", element: <SchedaReperto /> },
          { path: "wp10/modelli/:modelId", element: <MyModelComponent /> },
          { path: "wp10/login", element: <Login /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: "admin", element: <Admin /> },
              { path: "bulk-upload", element: <BulkUploadZip /> },
              { path: "bulk-images-upload", element: <RepertoImagesUploader /> },
              { path: "admin/upload-3d", element: <UploadReperto3D /> },
            ],
          },
        ],
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  ), [filtrati, menuFiltri, loading]);

  if (loading && siporData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#800020' }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;