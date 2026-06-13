import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, MenuItem, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

const categorie = [
    { value: 'misura', label: 'Misura' },
    { value: 'materiale', label: 'Materiale' },
    { value: 'danno', label: 'Danno' },
    { value: 'restauro', label: 'Restauro' },
    { value: 'descrizione', label: 'Descrizione' },
];

const ARCHEO_CONCEPTS = [
    { name: "Punta affilata/Estremità", expected3D: "PUNTO", keywords: ['punta', 'estremità', 'acuto', 'vertice', 'singolo punto'] },
    { name: "Manico/Ansa", expected3D: "AREA", keywords: ['ansa', 'manico', 'impugnatura', 'zona curva', 'supporto'] },
    { name: "Base/Piede", expected3D: "AREA", keywords: ['base', 'fondo', 'piede', 'superficie di appoggio', 'parte inferiore'] },
    { name: "Decorazione", expected3D: "AREA", keywords: ['motivo decorativo', 'fregio', 'disegno', 'incisione'] },
];

const checkTextCoherenceIA = async (text, target, model) => {
    if (!text || !model || text.length < 5) return null;

    return await tf.tidy(() => {
        const isPolygon = target.type === '3D-Polygon';
        const geometryType = isPolygon ? 'AREA' : 'PUNTO';
        const SIMILARITY_THRESHOLD = 0.5;

        // Embedding sincrono (all'interno di tidy)
        const textEmbedding = model.embed([text]);
        
        let maxSimilarity = -Infinity;
        let bestMatch = null;

        for (const concept of ARCHEO_CONCEPTS) {
            const conceptEmbedding = model.embed([concept.keywords.join(' ')]);
            const similarity = tf.matMul(textEmbedding, conceptEmbedding, false, true).dataSync()[0];

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = concept;
            }
        }

        if (maxSimilarity > SIMILARITY_THRESHOLD) {
            const percentage = Math.round(maxSimilarity * 100);
            if (bestMatch.expected3D === 'AREA' && geometryType === 'PUNTO') {
                return `IA Warning (${percentage}%): Suggerisci un'**area** ("${bestMatch.name}"), ma hai selezionato un punto.`;
            }
            if (bestMatch.expected3D === 'PUNTO' && geometryType === 'AREA') {
                return `IA Warning (${percentage}%): Suggerisci un **punto** ("${bestMatch.name}"), ma hai tracciato un'area.`;
            }
        }
        return null;
    });
};

const AnnotazioneForm = ({ open, onClose, modelId, target, onSaveSuccess }) => {
    const [categoria, setCategoria] = useState('descrizione');
    const [testo, setTesto] = useState('');
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const [iaCoherenceWarning, setIaCoherenceWarning] = useState(null);
    const [iaModel, setIaModel] = useState(null);
    const [isLoadingIa, setIsLoadingIa] = useState(true);

    // Caricamento modello
    useEffect(() => {
        let isMounted = true;
        const loadModel = async () => {
            try {
                await tf.ready();
                const model = await use.load();
                if (isMounted) {
                    setIaModel(model);
                    setIsLoadingIa(false);
                }
            } catch (error) {
                if (isMounted) setIsLoadingIa(false);
            }
        };
        if (open && !iaModel) loadModel();
        return () => { isMounted = false; };
    }, [open, iaModel]);

    // Debounced Validation
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (open && iaModel && testo.length > 5) {
                const warning = await checkTextCoherenceIA(testo, target, iaModel);
                setIaCoherenceWarning(warning);
            }
        }, 800);
        return () => clearTimeout(handler);
    }, [testo, target, open, iaModel]);

    const getCoordinates = useCallback(() => {
        if (!target) return { x: 0, y: 0, z: 0, areaData: null };
        if (target.type === '3D-Polygon' && target.coordinates?.length > 0) {
            const sum = target.coordinates.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }), { x: 0, y: 0, z: 0 });
            return { x: sum.x / target.coordinates.length, y: sum.y / target.coordinates.length, z: sum.z / target.coordinates.length, areaData: target.coordinates };
        }
        return { x: target.x, y: target.y, z: target.z, areaData: null };
    }, [target]);

    const coordinates = getCoordinates();

    const handleSubmit = async () => {
        if (iaCoherenceWarning?.includes("Warning") && !window.confirm("Attenzione: l'IA ha rilevato incongruenze. Salvare comunque?")) return;

        const payload = {
            modello: parseInt(modelId),
            testo, categoria,
            autore_nome: nome, autore_cognome: cognome,
            posizione_x: coordinates.x, posizione_y: coordinates.y, posizione_z: coordinates.z,
            poligono_vertici: coordinates.areaData || null
        };

        try {
            const response = await fetch('http://35.159.80.193:8000/api/annotazioni/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Errore salvataggio:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Nuova annotazione</DialogTitle>
            <DialogContent>
                {isLoadingIa && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="caption">Caricamento IA...</Typography></Box>}
                <TextField label="Nome" fullWidth margin="normal" value={nome} onChange={e => setNome(e.target.value)} />
                <TextField label="Cognome" fullWidth margin="normal" value={cognome} onChange={e => setCognome(e.target.value)} />
                <TextField select label="Categoria" fullWidth margin="normal" value={categoria} onChange={e => setCategoria(e.target.value)}>
                    {categorie.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </TextField>
                {iaCoherenceWarning && <Alert severity="warning" sx={{ mt: 2 }}>{iaCoherenceWarning}</Alert>}
                <TextField label="Testo annotazione" fullWidth multiline rows={4} margin="normal" value={testo} onChange={e => setTesto(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annulla</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!testo || isLoadingIa}>Salva</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnotazioneForm;