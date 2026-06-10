import React, { useState } from 'react';
import axios from 'axios';
import { 
    Box, Button, Typography, LinearProgress, Paper, 
    Alert, List, ListItem, ListItemText, Divider, CircularProgress 
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon, 
    CheckCircle as CheckCircleIcon,
    PhotoLibrary as PhotoLibraryIcon 
} from '@mui/icons-material';

const BulkImagesUploadZip = () => {
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
            setErrorMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        // 1. Prepariamo il FormData con la chiave sincronizzata col backend per lo zip immagini
        const formData = new FormData();
        formData.append('file_zip', file);

        setStatus('uploading');
        setErrorMessage('');
        setProgress(0);

        // 2. Recuperiamo il token d'autenticazione dal localStorage coerente con la dashboard
        const token = localStorage.getItem('adminToken');

        // 🔴 --- BLOCCO CONSOLE.LOG DI DEBUG ---
        console.log("=========================================");
        console.log("🔍 [DEBUG IMAGES UPLOAD] Verifica dello stato del Token prima dell'invio:");
        console.log("Valore estratto da localStorage.getItem('adminToken'):", token);
        console.log("Header Authorization finale inviato:", `Token ${token}`);
        console.log("File ZIP immagini associato al FormData:", file ? file.name : "Nessun file");
        console.log("=========================================");

        try {
            // 3. ✅ URL SINCRO CORRETTO: Modificato 'upload_images_zip' in 'upload-images-zip/' per allinearsi al backend
            const response = await axios.post('http://3.72.87.237:8000/api/immagini_reperto/upload-images-zip/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${token}` 
                },
                timeout: 0, // Timeout disabilitato per archivi massivi pesanti
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
            console.error("❌ Errore intercettato durante la chiamata Axios (Immagini ZIP):", err);
            setStatus('error');
            
            if (err.response?.status === 401) {
                setErrorMessage("Sessione non valida o scaduta. Effettua nuovamente il login.");
            } else {
                setErrorMessage(err.response?.data?.error || "Errore critico durante l'upload delle immagini o l'associazione. Verifica la dimensione del file o la connessione al server.");
            }
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }} gutterBottom>
                📷 Bulk Images Uploader
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
                Trascina qui lo ZIP contenente le immagini dei reperti nominate con codice numerico o parlante (es. MO1138 (1).jpg, MO1138(2).png...)
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
                    id="images-zip-upload-input"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="images-zip-upload-input">
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle1" display="block">
                        {file ? `File selezionato: ${file.name}` : "Trascina lo ZIP delle immagini qui o clicca per sfogliare"}
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
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {status === 'processing' && <CircularProgress size={16} />}
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {status === 'uploading' 
                                ? `Caricamento file: ${progress}%` 
                                : "🚀 Elaborazione server: lettura archivio, pulizia codici ed associazione record..."}
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
                startIcon={status === 'processing' ? <CircularProgress size={20} color="inherit" /> : <PhotoLibraryIcon />}
            >
                {status === 'uploading' ? 'Trasferimento immagini...' : 
                 status === 'processing' ? 'Attendere associazione DB...' : 'Avvia Caricamento Immagini'}
            </Button>

            {/* REPORT DETTAGLIATO */}
            {status === 'success' && report && (
                <Box sx={{ mt: 4 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                        Elaborazione completata! Create ed associate {report.immagini_create} immagini nel catalogo.
                    </Alert>
                    
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2, border: '1px solid #eee', borderRadius: 2 }}>
                        <List dense>
                            <Typography variant="overline" sx={{ px: 2, fontWeight: 'bold', color: 'green' }}>
                                Riepilogo operazioni:
                            </Typography>
                            <ListItem>
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, mr: 1 }} />
                                <ListItemText primary={`Totale immagini caricate con successo: ${report.immagini_create}`} />
                            </ListItem>
                        </List>
                        
                        {report.errori && report.errori.length > 0 && (
                            <>
                                <Divider />
                                <List dense>
                                    <Typography variant="overline" sx={{ px: 2, fontWeight: 'bold', color: 'error.main' }}>
                                        Anomalie o reperti non trovati nel DB:
                                    </Typography>
                                    {report.errori.map((err, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemText primary={err} sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: '0.85rem' }} />
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

export default BulkImagesUploadZip;