import axios from "axios";

// Uso un URL base più generico
const BASE_URL = "http://35.159.80.193:8000/api"; 
const REPERTI_BASE_URL = "http://35.159.80.193:8000/api/reperti"


export const fetchSiporDataWithDebug = async () => {
  try {
    const response = await axios.get(REPERTI_BASE_URL);
    const dati = response.data || [];

    // 🔍 LOGICA DI DEBUG INTEGRATA
    const trovato = dati.find(o => String(o.codice).toLowerCase().includes('mo1138'));
    
    console.log("=== VERIFICA MO1138 ===");
    if (trovato) {
      console.log("Il reperto ESISTE nel database. Struttura completa dell'oggetto:", trovato);
    } else {
      console.error("Il reperto NON VIENE INVIATO dal backend. Controlla le query o l'uploader.");
    }
    console.log("=======================");

    return dati;
  } catch (error) {
    console.error("Errore durante il recupero dei dati della collezione:", error);
    throw error;
  }
};

// Nuova funzione per recuperare il singolo reperto tramite codice
export const fetchRepertoByCodice = async (codice) => {
    try {
        // DRF usa il 'codice' come lookup_field, quindi l'URL è /api/reperti/<codice>/
        const response = await axios.get(`${REPERTI_BASE_URL}${codice}/`);
        return response.data;
    } catch (error) {
        // Uso il codice nello stack per debugging
        console.error(`Errore durante il recupero del reperto con codice ${codice}:`, error);
        throw error;
    }
}