import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
    Alert,
    CircularProgress, 
} from '@mui/material';

// 💥 Importazioni Reali di TensorFlow.js
import * as tf from '@tensorflow/tfjs'; 
import * as use from '@tensorflow-models/universal-sentence-encoder'; 

const categorie = [
    {value: 'misura', label: 'Misura'},
    {value: 'materiale', label: 'Materiale'},
    {value: 'danno', label: 'Danno'},
    {value: 'restauro', label: 'Restauro'},
    {value: 'descrizione', label: 'Descrizione'},
];

// =========================================================
// UTILITY IA: Somiglianza del Coseno
// =========================================================

/**
 * Calcola la somiglianza del coseno tra due tensori di embedding.
 * @param {tf.Tensor} embeddingA
 * @param {tf.Tensor} embeddingB
 * @returns {number} Somiglianza del coseno (da -1 a 1).
 */
const calculateCosineSimilarity = (embeddingA, embeddingB) => {
    // La somiglianza del coseno tra due vettori unitari è il loro prodotto scalare
    const similarity = tf.matMul(embeddingA, embeddingB, false, true).dataSync()[0];
    return similarity;
};

// 🧠 CONCETTI ARCHEOLOGICI CHIAVE per il confronto NLP
const ARCHEO_CONCEPTS = [
    { name: "Punta affilata/Estremità", expected3D: "PUNTO", keywords: ['punta', 'estremità', 'acuto', 'vertice', 'singolo punto'] },
    { name: "Manico/Ansa", expected3D: "AREA", keywords: ['ansa', 'manico', 'impugnatura', 'zona curva', 'supporto'] },
    { name: "Base/Piede", expected3D: "AREA", keywords: ['base', 'fondo', 'piede', 'superficie di appoggio', 'parte inferiore'] },
    { name: "Decorazione", expected3D: "AREA", keywords: ['motivo decorativo', 'fregio', 'disegno', 'incisione'] },
];

// =========================================================
// LOGICA IA: VALIDAZIONE TESTUALE REALE
// =========================================================

/**
 * Funzione reale per il controllo di coerenza usando TensorFlow.js e USE.
 * @param {string} text - Il testo dell'utente.
 * @param {object} target - I dati 3D.
 * @param {object} model - Il modello USE caricato.
 * @returns {Promise<string|null>} - Messaggio di warning o null.
 */
const checkTextCoherenceIA = async (text, target, model) => {
    // Ignora testi troppo corti o se mancano elementi chiave
    if (!text || !model || !target || text.length < 5) return null; 

    const isPolygon = target.type === '3D-Polygon';
    const geometryType = isPolygon ? 'AREA' : 'PUNTO';
    const SIMILARITY_THRESHOLD = 0.5; // Soglia per considerare il testo "Rilevante"

    try {
        // 1. Calcola l'embedding del testo dell'utente
        const textEmbedding = await model.embed([text]);
        
        let maxSimilarity = -Infinity;
        let bestMatch = null;
        const conceptEmbeddings = [];

        // 2. Confronta con i concetti chiave
        for (const concept of ARCHEO_CONCEPTS) {
            const conceptText = concept.keywords.join(' '); 
            // Calcolo dell'embedding del concetto 
            const conceptEmbedding = await model.embed([conceptText]);
            conceptEmbeddings.push(conceptEmbedding);
            
            const similarity = calculateCosineSimilarity(textEmbedding, conceptEmbedding);

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = concept;
            }
        }
        
        // 3. Logica di Validazione
        if (maxSimilarity > SIMILARITY_THRESHOLD) {
            const percentage = Math.round(maxSimilarity * 100);

            // Controllo Incongruenza Geometria/Testo
            if (bestMatch.expected3D === 'AREA' && geometryType === 'PUNTO') {
                 return `IA Warning (Coerenza ${percentage}%): Il testo suggerisce un'**area** ("${bestMatch.name}"), ma hai selezionato un punto.`;
            }
            if (bestMatch.expected3D === 'PUNTO' && geometryType === 'AREA') {
                 return `IA Warning (Coerenza ${percentage}%): Il testo suggerisce un **punto** ("${bestMatch.name}"), ma hai tracciato un poligono.`;
            }
        } else if (text.length > 50) {
             // Se il testo è molto lungo ma non trova somiglianze chiare
             return 'IA Alert: Il testo è lungo ma la somiglianza con i concetti archeologici è bassa. Riscrivi con termini più specifici.';
        }

        // 4. Libera la memoria (ESSENZIALE in tf.js)
        tf.dispose([textEmbedding, ...conceptEmbeddings]);

    } catch (error) {
        console.error("Errore durante l'analisi NLP di tf.js:", error);
        return "IA Error: Impossibile eseguire la validazione NLP.";
    }
    
    return null; // Tutto coerente
};


// =========================================================
// COMPONENTE PRINCIPALE (CON STATI IA)
// =========================================================

const AnnotazioneForm = ({open, onClose, modelId, target, onSaveSuccess}) => {
    const [categoria, setCategoria] = useState ('descrizione');
    const [testo, setTesto] = useState ('');
    const [nome, setNome] = useState ('');
    const [cognome, setCognome] = useState ('');
    const [iaCoherenceWarning, setIaCoherenceWarning] = useState(null); 
    
    // 🧠 STATI IA: Caricamento e Modello
    const [iaModel, setIaModel] = useState(null); 
    const [isLoadingIa, setIsLoadingIa] = useState(true); 

    // 🧠 EFFETTO 1: Caricamento del modello Universal Sentence Encoder (Solo una volta)
    useEffect(() => {
        const loadModel = async () => {
            try {
                setIsLoadingIa(true);
                // Inizializza TensorFlow
                await tf.ready(); 
                // Carica il modello USE
                const model = await use.load();
                setIaModel(model);
                setIsLoadingIa(false);
                console.log("TensorFlow.js Universal Sentence Encoder caricato con successo!");
            } catch (error) {
                console.error("Errore nel caricamento del modello IA:", error);
                setIsLoadingIa(false);
                setIaCoherenceWarning("Attenzione: Impossibile caricare il modello di Validazione IA.");
            }
        };

        if (!iaModel) {
            loadModel();
        }
    }, [iaModel]);

    // Logica Calcolo Coordinate/Centroide
    const getCoordinates = useCallback(() => {
        if (!target) return {x: null, y: null, z: null, areaData: null};
        
        if (target.type === '3D-Polygon' && target.coordinates.length > 0) {
            let sumX = 0, sumY = 0, sumZ = 0;
            target.coordinates.forEach(v => {
                sumX += v.x;
                sumY += v.y;
                sumZ += v.z;
            });
            const count = target.coordinates.length;
            
            return {
                x: sumX / count,
                y: sumY / count,
                z: sumZ / count,
                areaData: target.coordinates,
            };
        }
        
        return {
            x: target.x,
            y: target.y,
            z: target.z,
            areaData: null,
        };
    }, [target]);
    
    const coordinates = getCoordinates();

    // 💡 Reset degli stati
    useEffect (() => {
        if (open) {
            setCategoria ('descrizione');
            setTesto ('');
            setNome ('');
            setCognome ('');
            if (!iaModel) setIsLoadingIa(true); 
            else setIaCoherenceWarning(null); 
        }
    }, [open, iaModel]);
    
    // 🧠 EFFETTO 2: Esegue il controllo di coerenza REALE
    useEffect(() => {
        // Esegue la validazione solo se il form è aperto, il modello è pronto e non in caricamento.
        if (open && iaModel && !isLoadingIa) {
            const runValidation = async () => {
                // Chiama la funzione IA asincrona
                const warning = await checkTextCoherenceIA(testo, target, iaModel);
                setIaCoherenceWarning(warning);
            };
            runValidation();
        } else if (open && isLoadingIa) {
            // Messaggio di caricamento in attesa del modello
            setIaCoherenceWarning("Attendere: Caricamento modello IA (NLP)...");
        }
    }, [testo, target, open, iaModel, isLoadingIa]); 


    const handleSubmit = async () => {
        if (!testo || !target || coordinates.x == null) {
            console.error ('Impossibile salvare: Testo o coordinate mancanti.');
            return;
        }
        
        // Conferma opzionale se c'è un warning di coerenza
        if (iaCoherenceWarning && iaCoherenceWarning.includes("Warning") && 
            !window.confirm("Attenzione: l'IA ha rilevato un possibile errore di coerenza. Vuoi salvare comunque?")) {
            return;
        }

        const payload = {
            modello: modelId,
            testo,
            categoria,
            autore_nome: nome,
            autore_cognome: cognome,
            posizione_x: coordinates.x, 
            posizione_y: coordinates.y,
            posizione_z: coordinates.z,
            // Invia i vertici completi al backend come JSON string
            poligono_vertici: coordinates.areaData ? JSON.stringify(coordinates.areaData) : null, 
        };
        
        try {
            const response = await fetch ('https://handbook-graceless-sheath.ngrok-free.dev/api/annotazioni/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify (payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch (() => ({detail: `Errore HTTP! Status: ${response.status}`}));
                throw new Error (`Errore durante il salvataggio: ${errorData.detail || JSON.stringify(errorData)}`);
            }

            console.log ('Annotazione salvata:', await response.json());

            if (onSaveSuccess) {
                onSaveSuccess ();
            }
        } catch (error) {
            console.error ("Errore durante il salvataggio dell'annotazione:", error);
        }

        onClose ();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Nuova annotazione</DialogTitle>
            <DialogContent>
                {/* Visualizza lo stato di caricamento del modello IA */}
                {isLoadingIa && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">Caricamento moduli IA...</Typography>
                    </Box>
                )}

                {/* Campi Nome, Cognome e Categoria */}
                <TextField label="Nome autore" fullWidth margin="normal" value={nome} onChange={e => setNome (e.target.value)} />
                <TextField label="Cognome autore" fullWidth margin="normal" value={cognome} onChange={e => setCognome (e.target.value)} />
                <TextField select label="Categoria" fullWidth margin="normal" value={categoria} onChange={e => setCategoria (e.target.value)} >
                    {categorie.map (c => (<MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>))}
                </TextField>
                
                {/* 🧠 ALERT IA: Mostra il warning di coerenza se presente */}
                {iaCoherenceWarning && (
                    <Alert severity={iaCoherenceWarning.includes("Error") ? "error" : "warning"} sx={{ marginTop: 2 }}>
                        {iaCoherenceWarning}
                    </Alert>
                )}

                {/* Testo Annotazione */}
                <TextField
                    label="Testo annotazione"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    value={testo}
                    onChange={e => setTesto (e.target.value)}
                    error={open && !testo} 
                    helperText={open && !testo ? "Il testo dell'annotazione è obbligatorio." : ''}
                    disabled={isLoadingIa} // Disabilita se l'IA sta ancora caricando
                />

                {/* Coordinate e Dati Areali */}
                {target && (
                    <Box
                        sx={{
                            marginTop: 2,
                            fontSize: '0.9rem',
                            color: '#555',
                            p: 1,
                            border: '1px solid #eee',
                            borderRadius: '4px',
                            background: '#f9f9f9',
                        }}
                    >
                        {coordinates.areaData ? (
                            <Typography variant="caption" display="block">
                                Area selezionata (Poligono di **{coordinates.areaData.length}** vertici)
                            </Typography>
                        ) : (
                            <Typography variant="caption" display="block">
                                Punto selezionato
                            </Typography>
                        )}
                        <strong>
                            Posizione (Centroid/Punto): X: {coordinates.x?.toFixed(3) || 'N/A'}, Y: {coordinates.y?.toFixed(3) || 'N/A'}, Z:{' '}
                            {coordinates.z?.toFixed(3) || 'N/A'}
                        </strong>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annulla</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    // Disabilita se mancano dati essenziali o se l'IA sta ancora caricando
                    disabled={!testo || !target || coordinates.x == null || isLoadingIa}
                >
                    Salva
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnotazioneForm;