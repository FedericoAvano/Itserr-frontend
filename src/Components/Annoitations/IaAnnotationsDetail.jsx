import React from 'react';
import { Typography, Box, Paper, Divider, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import MuseumIcon from '@mui/icons-material/Museum';

// --- Traduzioni e Icone ---
const detailMap = {
    luogo_ritrovamento: { label: "Ritrovamento", icon: LocationOnIcon, color: "primary" },
    luogo_produzione: { label: "Origine", icon: CategoryIcon, color: "secondary" },
    luogo_custodia: { label: "Custodia", icon: MuseumIcon, color: "info" },
    oggetti_rilevati: { label: "Oggetti Rilevati", icon: CategoryIcon, color: "success" },
};

// Funzione helper per Capitalizzare la prima lettera
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const IaAnnotationsDetail = ({ analisi_ia_json }) => {
    if (!analisi_ia_json || Object.keys(analisi_ia_json).length === 0) {
        return <Typography variant="caption" color="text.secondary">Nessuna analisi strutturata IA disponibile per questa annotazione.</Typography>;
    }

    const { luogo_ritrovamento, luogo_produzione, luogo_custodia, oggetti_rilevati } = analisi_ia_json;
    
    // Mappa i dati in una struttura visualizzabile
    const structuredData = [
        { key: 'luogo_ritrovamento', value: capitalize(luogo_ritrovamento) },
        { key: 'luogo_produzione', value: capitalize(luogo_produzione) },
        { key: 'luogo_custodia', value: capitalize(luogo_custodia) },
    ];

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 2, border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                Dati Strutturati (AI)
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            {/* Visualizzazione Luoghi/Origine */}
            <Box sx={{ mb: 2 }}>
                {structuredData.map(item => {
                    const detail = detailMap[item.key];
                    if (!item.value) return null;

                    const Icon = detail.icon;

                    return (
                        <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', mb: 1, color: detail.color }}>
                            <Icon sx={{ mr: 1, fontSize: 'small' }} color={detail.color} />
                            <Typography variant="body2">
                                <strong>{detail.label}:</strong> {item.value}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Visualizzazione Oggetti Rilevati (Chips) */}
            {oggetti_rilevati && oggetti_rilevati.length > 0 && (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ mr: 1, fontSize: 'small', color: 'success.main' }} />
                        Oggetti Rilevati:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {oggetti_rilevati.map((oggetto, index) => (
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

export default IaAnnotationsDetail;