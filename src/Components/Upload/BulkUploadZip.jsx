import React, { useState } from 'react';
import axios from 'axios';
import { 
    Box, Button, Typography, LinearProgress, Paper, 
    Alert, List, ListItem, ListItemText, Divider, CircularProgress 
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon, 
    CheckCircle as CheckCircleIcon,
    Storage as StorageIcon 
} from '@mui/icons-material';

const BulkUploadZip = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
    const [report, setReport] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);

    // Gestione selezione file classica
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.zip')) {
            setFile(selectedFile);
            setStatus('idle');
            setReport(null);
            setErrorMessage('');
        } else {
            setErrorMessage('Per favore seleziona un file .ZIP valido.');
        }
    };

    // Integrazione Drag & Drop nativa
    const onDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
    const onDragLeave = () => setIsDragActive(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.zip')) {
            setFile(droppedFile);
            setStatus('idle');
            setReport(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        // 1. Prepariamo il FormData con la chiave sincronizzata col backend ('file')
        const formData = new FormData();
        formData.append('file', file);

        setStatus('uploading');
        setErrorMessage('');
        setProgress(0);

        // 2. Recuperiamo il token d'autenticazione dal localStorage
        const token = localStorage.getItem('adminToken');

        // 🔴 --- BLOCCO CONSOLE.LOG DI DEBUG FRONTIERA ---
        console.log("=========================================");
        console.log("🔍 [DEBUG UPLOAD] Verifica dello stato del Token prima dell'invio:");
        console.log("Valore estratto da localStorage.getItem('token'):", token);
        console.log("Tipo di dato del token:", typeof token);
        console.log("Header Authorization finale inviato:", `Token ${token}`);
        console.log("File associato al FormData:", file ? file.name : "Nessun file");
        console.log("=========================================");

        try {
            // 3. Eseguiamo la richiesta includendo l'header Authorization
            const response = await axios.post('https://handbook-graceless-sheath.ngrok-free.dev/api/modelli/upload-zip/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${token}` 
                },
                timeout: 0, // ✅ Timeout disabilitato per gestire elaborazioni lunghe (100+ modelli)
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                    
                    if (percentCompleted === 100) {
                        setStatus('processing');
                    }
                }
            });

            setReport(response.data);
            setStatus('success');
            setFile(null);
        } catch (err) {
            console.error("❌ Errore intercettato durante la chiamata Axios:", err);
            setStatus('error');
            
            if (err.response?.status === 401) {
                setErrorMessage("Sessione non valida o scaduta. Effettua nuovamente il login.");
            } else {
                setErrorMessage(err.response?.data?.error || "Errore critico durante l'upload o l'estrazione.");
            }
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }} gutterBottom>
                📦 Bulk 3D Uploader
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
                Trascina qui l'archivio ZIP contenente le cartelle dei reperti (es. MO1138, MO1139...)
            </Typography>

            {/* AREA DROPZONE */}
            <Box 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                sx={{ 
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : '#ccc',
                    bgcolor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    p: 5, mb: 3, borderRadius: 2, textAlign: 'center',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer'
                }}
            >
                <input
                    accept=".zip"
                    style={{ display: 'none' }}
                    id="zip-upload-input"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="zip-upload-input">
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle1" display="block">
                        {file ? `File selezionato: ${file.name}` : "Trascina lo ZIP qui o clicca per sfogliare"}
                    </Typography>
                </label>
            </Box>

            {/* BARRA DI PROGRESSO E STATO ELABORAZIONE */}
            {(status === 'uploading' || status === 'processing') && (
                <Box sx={{ width: '100%', mb: 3 }}>
                    <LinearProgress 
                        variant={status === 'processing' ? "indeterminate" : "determinate"} 
                        value={progress} 
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContenit: 'center', gap: 1 }}>
                        {status === 'processing' && <CircularProgress size={16} />}
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {status === 'uploading' 
                                ? `Caricamento file: ${progress}%` 
                                : "🚀 Elaborazione server: estrazione modelli e associazione al database..."}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Button 
                variant="contained" 
                size="large"
                fullWidth
                onClick={handleUpload} 
                disabled={!file || status === 'uploading' || status === 'processing'}
                startIcon={status === 'processing' ? <StorageIcon /> : <CloudUploadIcon />}
            >
                {status === 'uploading' ? 'Trasferimento dati...' : 
                 status === 'processing' ? 'Attendere elaborazione...' : 'Avvia Caricamento Massivo'}
            </Button>

            {/* REPORT DETTAGLIATO */}
            {status === 'success' && report && (
                <Box sx={{ mt: 4 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                        Caricamento completato! Elaborati con successo.
                    </Alert>
                    
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2, border: '1px solid #eee', borderRadius: 2 }}>
                        <List dense>
                            <Typography variant="overline" sx={{ px: 2, fontWeight: 'bold' }}>
                                Modelli creati ed associati:
                            </Typography>
                            {report.creati.map((item, idx) => (
                                <ListItem key={idx}>
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, mr: 1 }} />
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                        {report.errori.length > 0 && (
                            <>
                                <Divider />
                                <List dense>
                                    <Typography variant="overline" sx={{ px: 2, fontWeight: 'bold', color: 'error.main' }}>
                                        Errori o avvisi:
                                    </Typography>
                                    {report.errori.map((err, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemText primary={err} sx={{ color: 'error.main' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Box>
                </Box>
            )}

            {status === 'error' && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    {errorMessage}
                </Alert>
            )}
        </Paper>
    );
};

export default BulkUploadZip;