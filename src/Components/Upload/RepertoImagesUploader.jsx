import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
    Box, Button, Typography, LinearProgress, Paper, 
    Alert, List, ListItem, ListItemText, Divider, CircularProgress,
    Tabs, Tab
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon, 
    CheckCircle as CheckCircleIcon,
    PhotoLibrary as PhotoLibraryIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon
} from '@mui/icons-material';

const RepertoImagesUploader = () => {
    const [currentTab, setCurrentTab] = useState(0); // 0: Bulk ZIP, 1: Singolo
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
    const [report, setReport] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        resetFormState();
    };

    const resetFormState = () => {
        setFile(null);
        setPreview(null);
        setProgress(0);
        setStatus('idle');
        setReport(null);
        setErrorMessage('');
    };

    // Gestione selezione file classica
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        processSelectedFile(selectedFile);
    };

    // Integrazione Drag & Drop nativa
    const onDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
    const onDragLeave = () => setIsDragActive(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (!droppedFile) return;
        processSelectedFile(droppedFile);
    };

    // Validazione preliminare a seconda del Tab attivo
    const processSelectedFile = (selectedFile) => {
        if (currentTab === 0) {
            // Validazione ZIP
            if (selectedFile.name.endsWith('.zip')) {
                setFile(selectedFile);
                setStatus('idle');
                setReport(null);
                setErrorMessage('');
            } else {
                setErrorMessage('Per favore seleziona un file .ZIP valido per il caricamento bulk.');
            }
        } else {
            // Validazione Immagine Singola
            const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
            if (allowedExtensions.exec(selectedFile.name)) {
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
                setStatus('idle');
                setReport(null);
                setErrorMessage('');
            } else {
                setErrorMessage('Formato non valido. Carica solo file .jpg, .jpeg o .png');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        const token = localStorage.getItem('adminToken');
        
        // Configura l'endpoint e il payload in base all'azione scelta
        const endpoint = currentTab === 0 
            ? 'http://3.72.87.237:8000/api/immagini_reperto/upload-images-zip/' 
            : 'http://3.72.87.237:8000/api/immagini_reperto/upload-single-image/';
        
        if (currentTab === 0) {
            formData.append('file_zip', file);
        } else {
            formData.append('file', file);
        }

        setStatus('uploading');
        setErrorMessage('');
        setProgress(0);

        // 🔴 --- BLOCCO CONSOLE.LOG DI DEBUG ---
        console.log("=========================================");
        console.log(`🔍 [DEBUG IMAGES UPLOAD] Modalità: ${currentTab === 0 ? 'BULK ZIP' : 'SINGOLA IMMA'}`);
        console.log("Valore estratto da localStorage.getItem('adminToken'):", token);
        console.log("Header Authorization finale inviato:", `Token ${token}`);
        console.log("File associato al FormData:", file.name);
        console.log("=========================================");

        try {
            const response = await axios.post(endpoint, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${token}` 
                },
                timeout: 0,
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
            
            // Per il caricamento singolo svuotiamo la preview dopo il successo
            if (currentTab === 1) {
                setPreview(null);
                setFile(null);
            } else {
                setFile(null);
            }
        } catch (err) {
            console.error("❌ Errore intercettato durante la chiamata Axios:", err);
            setStatus('error');
            
            if (err.response?.status === 401) {
                setErrorMessage("Sessione non valida o scaduta. Effettua nuovamente il login.");
            } else {
                setErrorMessage(err.response?.data?.error || "Errore critico durante l'upload o l'associazione. Verifica il nome del file o la connessione.");
            }
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4, borderRadius: 3 }}>
            
            {/* TABS DI COMMUTAZIONE */}
            <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                variant="fullWidth" 
                indicatorColor="primary" 
                textColor="primary"
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab icon={<PhotoLibraryIcon />} label="Caricamento Bulk (.ZIP)" id="tab-bulk" />
                <Tab icon={<AddPhotoAlternateIcon />} label="Immagine Singola (.JPG/.PNG)" id="tab-singolo" />
            </Tabs>

            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }} gutterBottom>
                {currentTab === 0 ? "📷 Bulk Images Uploader" : "🖼️ Single Image Uploader"}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
                {currentTab === 0 
                    ? "Trascina qui lo ZIP contenente le immagini dei reperti nominate con codice numerico o parlante (es. MO1138 (1).jpg, MO1138(2).png...)"
                    : "Carica un singolo file immagine. Il sistema estrarrà automaticamente il codice dal nome (es. MO1138.jpg o MO1138 (2).png) per associarlo al database."
                }
            </Typography>

            {/* AREA DROPZONE */}
            <Box 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                sx={{ 
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : '#ccc',
                    bgcolor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    p: preview ? 3 : 5, mb: 3, borderRadius: 2, textAlign: 'center',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <input
                    ref={fileInputRef}
                    accept={currentTab === 0 ? ".zip" : ".jpg,.jpeg,.png"}
                    style={{ display: 'none' }}
                    type="file"
                    onChange={handleFileChange}
                />
                
                {preview ? (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box 
                            component="img" 
                            src={preview} 
                            alt="Anteprima reperto" 
                            sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 2, objectFit: 'contain', boxShadow: 2, mb: 2 }} 
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
                            {file?.name}
                        </Typography>
                        <Button size="small" variant="outlined" sx={{ mt: 1 }}>Cambia File</Button>
                    </Box>
                ) : (
                    <Box>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="subtitle1">
                            {file ? `File selezionato: ${file.name}` : `Trascina qui il file ${currentTab === 0 ? '.ZIP' : 'immagine'} o clicca per sfogliare`}
                        </Typography>
                        {currentTab === 1 && (
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                Formati accettati: JPG, JPEG, PNG
                            </Typography>
                        )}
                    </Box>
                )}
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
                                : "🚀 Elaborazione server: estrazione del codice, pulizia ed associazione record..."}
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
                startIcon={status === 'processing' ? <CircularProgress size={20} color="inherit" /> : currentTab === 0 ? <PhotoLibraryIcon /> : <AddPhotoAlternateIcon />}
            >
                {status === 'uploading' ? 'Trasferimento in corso...' : 
                 status === 'processing' ? 'Attendere associazione DB...' : 
                 currentTab === 0 ? 'Avvia Caricamento Immagini ZIP' : 'Associa Immagine Singola'}
            </Button>

            {/* REPORT DETTAGLIATO */}
            {status === 'success' && report && (
                <Box sx={{ mt: 4 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                        {currentTab === 0 
                            ? `Elaborazione completata! Create ed associate ${report.immagini_create} immagini nel catalogo.`
                            : `Immagine associata correttamente! ${report.messaggio || ''}`
                        }
                    </Alert>
                    
                    {currentTab === 0 && (
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
                    )}
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

export default RepertoImagesUploader;