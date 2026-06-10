import React, { useMemo } from "react"; 
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Typography, Box, Paper, Divider, Chip, Grid 
} from "@mui/material";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

// Icone Material UI
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import MuseumIcon from '@mui/icons-material/Museum';

// --- Mappa per la Visualizzazione Strutturata (CHIAVI CORRETTE DAL BACKEND) ---
const detailMap = {
    evento_scavo_luogo: { label: "Ritrovamento / Scavo", icon: LocationOnIcon, color: "primary" },
    evento_produzione_luogo: { label: "Origine / Produzione", icon: CategoryIcon, color: "secondary" },
    evento_custodia_luogo: { label: "Custodia Attuale", icon: MuseumIcon, color: "info" },
};

// Funzione helper per Capitalizzare la prima lettera
const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// ----------------------------------------------------
// FUNZIONE DI PARSING (AGGIORNATA PER LO SCHEMA APPIATTITO)
// ----------------------------------------------------
const parseAnnotationData = (annotation) => {
    // 1. Gestione del caso nullo (per la chiusura del Dialog)
    if (!annotation) {
        return { testo: "Nessun testo disponibile.", analisi_ia_json: null, autoreNome: "Anonimo", autoreCognome: "", dataCreazione: null };
    }
    
    // 2. ESTRAZIONE DIRETTA (SCHEMA APPIATTITO)
    const testo = annotation.testo || "Nessun testo disponibile.";
    
    // Assicuriamo che analisi_ia_json sia un oggetto parsato, se è una stringa
    let analisi_ia_json = annotation.analisi_ia_json || null;
    if (typeof analisi_ia_json === 'string') {
        try {
             analisi_ia_json = JSON.parse(analisi_ia_json);
        } catch (e) {
             console.error("PARSING APP. - Errore nel parsing JSON dell'analisi IA:", e);
        }
    }
    
    const autoreNome = annotation.autore_nome || "Anonimo";
    const autoreCognome = annotation.autore_cognome || "";
    const dataCreazione = annotation.creato_il || null; // Usiamo il campo 'creato_il'
    
    return { testo, analisi_ia_json, autoreNome, autoreCognome, dataCreazione };
};
// ----------------------------------------------------


// ----------------------------------------------------
// SUB-COMPONENTE: Visualizza i dettagli IA 
// ----------------------------------------------------
const DettagliAnalisiIA = ({ analisi_ia_json }) => {
    if (!analisi_ia_json || (typeof analisi_ia_json === 'object' && Object.keys(analisi_ia_json).length === 0)) {
        return (
            <Box mt={2} mb={2}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" color="text.secondary">Nessuna analisi strutturata IA disponibile.</Typography>
            </Box>
        );
    }
    
    // CORREZIONE CRITICA: Uso dei nomi dei campi esatti dal backend
    const { 
        evento_scavo_luogo, 
        evento_produzione_luogo, 
        evento_custodia_luogo, 
        oggetto_rilevato_tipologia // Chiave corretta per gli oggetti
    } = analisi_ia_json;
    
    const structuredData = [
        { key: 'evento_scavo_luogo', value: capitalize(evento_scavo_luogo) },
        { key: 'evento_produzione_luogo', value: capitalize(evento_produzione_luogo) },
        { key: 'evento_custodia_luogo', value: capitalize(evento_custodia_luogo) },
    ];

    return (
        <Paper elevation={0} sx={{ p: 2, mt: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Analisi Strutturata (AI)
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            <Grid container spacing={1}>
                {structuredData.map(item => {
                    // La chiave deve ora corrispondere a detailMap e al backend
                    const detail = detailMap[item.key]; 
                    if (!item.value) return null;

                    const Icon = detail.icon;

                    return (
                        <Grid item xs={12} sm={6} key={item.key}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <Icon sx={{ mr: 1, mt: '2px', fontSize: 'small' }} color={detail.color} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                                        {detail.label}:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: detail.color }}>
                                        {item.value}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            {/* CORREZIONE: Controlla oggetto_rilevato_tipologia */}
            {oggetto_rilevato_tipologia && oggetto_rilevato_tipologia.length > 0 && (
                <Box mt={2}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ mr: 1, fontSize: 'small' }} color="success" />
                        Oggetti Rilevati:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {oggetto_rilevato_tipologia.map((oggetto, index) => (
                            <Chip 
                                key={index} 
                                label={capitalize(oggetto)} 
                                size="small" 
                                color="success" 
                                variant="outlined" 
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};
// ----------------------------------------------------


// ----------------------------------------------------
// COMPONENTE PRINCIPALE: AnnotationDetailDialog (Invariato)
// ----------------------------------------------------
const AnnotationDetailDialog = ({ open, onClose, annotation }) => {
    
    const { testo, analisi_ia_json, autoreNome, autoreCognome, dataCreazione } = useMemo(
        () => parseAnnotationData(annotation), 
        [annotation]
    );

    // Gestione di valori mancanti
    const formattedDate = dataCreazione ? format(new Date(dataCreazione), "dd MMMM yyyy HH:mm", { locale: it }) : 'N/D';
    const categoria = annotation?.categoria || 'Non Specificata';
    const autore = annotation ? `${autoreNome} ${autoreCognome}` : 'N/D';
    
    const testoContenuto = (testo === 'Nessun testo disponibile.' && !annotation) 
        ? 'Caricamento in corso o dati mancanti.' 
        : testo;


    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            sx={{ zIndex: 99999 }} 
        >
            <DialogTitle>Dettagli Annotazione</DialogTitle>
            <DialogContent>
                
                {/* Dettagli Base (Autore, Categoria, Data) */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Autore:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {autore}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Categoria:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {capitalize(categoria)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Creata il:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {formattedDate}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                {/* Testo Originale */}
                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        Testo Completo:
                    </Typography>
                    <Typography variant="body1" fontStyle="italic">
                        {testoContenuto}
                    </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                {/* INTEGRAZIONE DELL'ANALISI IA */}
                <DettagliAnalisiIA analisi_ia_json={analisi_ia_json} />

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Chiudi</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnotationDetailDialog;