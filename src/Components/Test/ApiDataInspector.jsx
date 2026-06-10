import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';

// Funzione di fetch definita internamente per questo test specifico
async function fetchTestData() {
  // ✅ CORREZIONE: URL completo e corretto
  const TEST_URL = "https://museoscerrato.unior.it/restSipor/rest/json/fun/visualizzaScheda";

  try {
    const response = await fetch(TEST_URL);
    
    // Tentiamo di leggere l'errore 500/404 se è in formato JSON
    if (!response.ok) {
        // Tenta di leggere il corpo della risposta in caso di errore non-200
        let errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.message || errorJson.error || errorText;
        } catch (e) {
            // Ignora se non è JSON
        }
        throw new Error(`HTTP Error ${response.status}: ${errorText || 'Internal Server Error'}`);
    }
    
    const data = await response.json();
    
    // Controlla il campo di errore nel payload dell'API
    if (data.messageResponse && data.messageResponse.error) {
         console.error("API Error nel payload:", data.messageResponse.message);
         return null; 
    }
    
    // Restituisce l'array di dati (jsonData)
    return data.jsonData || []; 

  } catch (error) {
    console.error(`Errore nel recupero dati di test:`, error);
    throw error;
  }
}


const ApiDataInspector = () => {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchTestData()
      .then(data => {
        // LOG CHIAVE: stampa la risposta grezza!
        console.log("--- RISPOSTA GREZZA ENDPOINT /visualizzaScheda (Senza filtri) ---");
        console.log(data); 
        console.log("-------------------------------------------------------------------");

        if (!data || data.length === 0) {
            // Se l'errore non è di rete, ma è un array vuoto, mostra un warning
            setError("La chiamata è andata a buon fine, ma il server ha restituito un array vuoto (Array(0)). L'endpoint probabilmente richiede un filtro.");
        } else {
            setRawData(data);
            setDataCount(data.length);
        }
      })
      .catch(err => {
        // Gestisce l'errore rilanciato dalla fetch (es. "HTTP Error 500: ...")
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ispezione Dati Corretta (Test Endpoint Scheda)
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        **Apri la console (F12) e riesegui il test.** L'URL è stato corretto. 🤞
      </Typography>

      {/* Visualizzazione Stato di Caricamento */}
      {loading && (
        <Box sx={{ py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>In attesa della risposta API...</Typography>
        </Box>
      )}

      {/* Visualizzazione Errori */}
      {error && (
        <Alert severity="error" sx={{ my: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
                *Suggerimento: Se vedi ancora un errore 500, l'endpoint **richiede** i parametri di filtro.*
            </Typography>
        </Alert>
      )}

      {/* Visualizzazione Dati Grezzi a Schermo */}
      {!loading && rawData && (
        <>
          <Alert severity="success" sx={{ my: 3 }}>
            Successo! Trovati {dataCount} campi/elementi. Controlla la console!
          </Alert>
          <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              I primi 5 campi/elementi nell'array:
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                overflowX: 'auto',
                borderRadius: 1,
                maxHeight: 600,
                whiteSpace: 'pre-wrap',
                fontSize: '0.85rem'
              }}
            >
              {JSON.stringify(rawData.slice(0, 5), null, 2)}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default ApiDataInspector;