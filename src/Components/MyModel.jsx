import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Sphere, Html } from "@react-three/drei";
import { useParams, useNavigate } from "react-router-dom";
import { EffectComposer, N8AO, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Vector3 } from 'three';
import { 
    Paper, Stack, IconButton, Tooltip, Typography, Box, useTheme, Dialog, 
    DialogTitle, DialogContent, Collapse, Slider, Switch, FormControlLabel, 
    Divider, Button,
} from "@mui/material";
import { 
    Straighten as StraightenIcon, Replay as ReplayIcon, NoteAlt as NoteAltIcon, 
    ArrowBackIos as ArrowBackIosIcon, ArrowForwardIos as ArrowForwardIosIcon,
    PhotoFilter as PhotoFilterIcon, BlurOn as BlurOnIcon, Description as DescriptionIcon, 
    Close as CloseIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, 
    ArrowBack as ArrowBackIcon, HelpOutline as HelpIcon, Layers as LayersIcon
} from "@mui/icons-material";

// Import componenti locali
import Loader from "./UI/Loader";
import MeasurementTool from "./3DTools/MeasurementTool";
import AnnotationPicker from "./3DTools/AnnotationPicker";
import AnnotationDetailDialog from "./3DTools/AnnotationDetailDialog"; 
import StudioLights from "./3DTools/StudioLights";
import AnnotazioneForm from "./Annoitations/AnnotationForm";
import ModelViewer from "../Logic/ModelViewer";

// --- UTILS ---
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint)
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth <= breakpoint);
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, [breakpoint]);
    return isMobile;
};

const makeAbsolute = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8000${cleanPath}`;
};

const parseCoordinates = (annotation) => {
    const w3cValue = annotation?.target?.selector?.value;
    if (w3cValue && w3cValue.includes('x=')) {
        const parts = w3cValue.split(';');
        const x = parseFloat(parts[0].split('=')[1]);
        const y = parseFloat(parts[1].split('=')[1]);
        const z = parseFloat(parts[2].split('=')[1]);
        return new Vector3(x, y, z);
    }
    if (typeof annotation.posizione_x === 'number') {
        return new Vector3(annotation.posizione_x, annotation.posizione_y, annotation.posizione_z);
    }
    return null;
};

// --- COMPONENTE PIN ---
const AnnotationPin = ({ annotation, onClick }) => {
    const position = parseCoordinates(annotation);
    const [hovered, setHovered] = useState(false);
    if (!position) return null;
    
    return (
        <Sphere args={[0.025, 32, 32]} position={position}
            onClick={(e) => { e.stopPropagation(); onClick(annotation); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; setHovered(false); }}>
            <meshStandardMaterial 
                color={hovered ? "#00fff2" : "#800020"} 
                emissive={hovered ? "#00fff2" : "#800020"} 
                emissiveIntensity={hovered ? 4 : 1.5} 
                roughness={0.2}
                metalness={0.1}
            />
        </Sphere>
    );
};

const MyModelComponent = () => {
    const { modelId } = useParams();
    const navigate = useNavigate();
    const controlsRef = useRef();
    const modelGroupRef = useRef();
    const modelRef = useRef(); 

    const isMobile = useIsMobile();
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

    // --- STATI ---
    const [modello, setModello] = useState(null);
    const [textureUrl, setTextureUrl] = useState(null); 
    const [errore, setErrore] = useState(null);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [openAnnotazione, setOpenAnnotazione] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState(null);  
    const [annotations, setAnnotations] = useState([]);
    const [showAnnotations, setShowAnnotations] = useState(true); 
    
    const [selectedAnnotation, setSelectedAnnotation] = useState(null); 
    const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false)
    const [openHelpDialog, setOpenHelpDialog] = useState(false);

    const [isSsaoPanelOpen, setIsSsaoPanelOpen] = useState(false);
    const [isBloomPanelOpen, setIsBloomPanelOpen] = useState(false);
    const [isSSAOEnabled, setIsSSAOEnabled] = useState(true);
    const [aoIntensity, setAoIntensity] = useState(2.0);
    const [isBloomEnabled, setIsBloomEnabled] = useState(true);
    const [bloomIntensity, setBloomIntensity] = useState(0.8); 

    const lightPresets = [
        { name: "Studio", ambient: { intensity: 0.8, color: "#fff" }, directional: [{ position: [5, 5, 5], intensity: 1.5 }] },
    ];

    const fetchAnnotations = useCallback(() => {
        fetch(`http://35.159.80.193:8000/api/annotazioni/?modello=${modelId}`)
            .then((res) => res.json())
            .then(setAnnotations)
            .catch((err) => console.error("Errore fetch:", err));
    }, [modelId]);

    useEffect(() => {
        fetch(`http://35.159.80.193:8000/api/modelli/${modelId}/`)
            .then((res) => res.ok ? res.json() : Promise.reject("Modello non trovato"))
            .then((data) => {
                setModello({ ...data, obj_file: makeAbsolute(data.obj_file), mtl_file: makeAbsolute(data.mtl_file) });
                if (data.textures?.length > 0) {
                    const rawPath = data.textures[0].url || data.textures[0].texture_file;
                    if (rawPath) setTextureUrl(makeAbsolute(rawPath));
                }
            })
            .catch((err) => setErrore(err));
        fetchAnnotations();
    }, [modelId, fetchAnnotations]);

    const handleModelLoad = useCallback((model) => {
        if (model && modelGroupRef.current) {
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                    }
                }
            });
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            modelGroupRef.current.position.copy(center.clone().negate()); 
        }
    }, []);

    const getIconButtonStyle = (isActive) => ({
        color: isActive ? "#ff4081" : "#ffffff",
        bgcolor: isActive ? "rgba(255, 64, 129, 0.15)" : "transparent",
        transition: "all 0.2s ease",
        borderRadius: "8px",
        "&:hover": { 
            color: "#ffffff", 
            bgcolor: "rgba(255,255,255,0.1)",
            transform: "translateY(-2px)" 
        }
    });

    const ControlPanel = ({ title, isOpen, onClose, children }) => (
        <Collapse in={isOpen} sx={{ position: 'absolute', top: 90, left: 20, zIndex: 2200 }}>
            <Paper elevation={12} sx={{ p: 2.5, background: "rgba(25, 25, 25, 0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", minWidth: 280, color: "#ffffff" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.75rem", color: "grey.400" }}>{title}</Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: "grey.500", "&:hover": { color: "white" } }}><CloseIcon fontSize="small" /></IconButton>
                </Box>
                <Stack spacing={2}>{children}</Stack>
            </Paper>
        </Collapse>
    );

    if (errore) return <Box p={4}><Typography color="error">Errore: {errore}</Typography></Box>;

    return (
        <Box sx={{ position: "relative", height: "100vh", width: "100vw", background: "radial-gradient(circle at center, #2a2a2a 0%, #0d0d0d 100%)", overflow: "hidden", margin: 0, padding: 0 }}>
            
            <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} variant="text" sx={{ position: "absolute", top: 20, right: 20, zIndex: 2000, color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 600, backdropFilter: "blur(8px)", bgcolor: "rgba(0,0,0,0.3)", px: 2, borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" } }}>Torna al reperto</Button>

            <Collapse in={toolbarOpen} orientation="horizontal" sx={{ position: "absolute", top: 20, left: 20, zIndex: 2000 }}>
                <Paper elevation={10} sx={{ p: 0.8, display: 'flex', gap: 0.5, borderRadius: '12px', bgcolor: 'rgba(25, 25, 25, 0.75)', backdropFilter: 'blur(12px)', border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Tooltip title="Regolazioni Ombre (SSAO)"><IconButton onClick={() => { setIsSsaoPanelOpen(!isSsaoPanelOpen); setIsBloomPanelOpen(false); }} sx={getIconButtonStyle(isSsaoPanelOpen)}><PhotoFilterIcon /></IconButton></Tooltip>
                    <Tooltip title="Effetti Bagliore (Bloom)"><IconButton onClick={() => { setIsBloomPanelOpen(!isBloomPanelOpen); setIsSsaoPanelOpen(false); }} sx={getIconButtonStyle(isBloomPanelOpen)}><BlurOnIcon /></IconButton></Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.15)" }} />
                    
                    {/* Pulsante Annotazioni aggiunto qui */}
                    <Tooltip title={showAnnotations ? "Nascondi Annotazioni" : "Mostra Annotazioni"}><IconButton onClick={() => setShowAnnotations(!showAnnotations)} sx={getIconButtonStyle(showAnnotations)}><LayersIcon /></IconButton></Tooltip>
                    
                    <Tooltip title="Strumento Righello"><IconButton onClick={() => setIsMeasuring(!isMeasuring)} sx={getIconButtonStyle(isMeasuring)}><StraightenIcon /></IconButton></Tooltip>
                    <Tooltip title="Inserisci Annotazione"><IconButton onClick={() => setSelectedTarget("waiting")} sx={getIconButtonStyle(selectedTarget === "waiting")}><NoteAltIcon /></IconButton></Tooltip>
                    <Tooltip title="Descrizione Reperto"><IconButton onClick={() => setOpenDescriptionDialog(true)} sx={getIconButtonStyle(openDescriptionDialog)}><DescriptionIcon /></IconButton></Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.15)" }} />
                    <Tooltip title="Guida"><IconButton onClick={() => setOpenHelpDialog(true)} sx={getIconButtonStyle(openHelpDialog)}><HelpIcon /></IconButton></Tooltip>
                    <Tooltip title="Ripristina Camera"><IconButton onClick={() => controlsRef.current?.reset()} sx={getIconButtonStyle(false)}><ReplayIcon /></IconButton></Tooltip>
                    <IconButton onClick={() => setToolbarOpen(false)} sx={getIconButtonStyle(false)}><ArrowBackIosIcon fontSize="small" /></IconButton>
                </Paper>
            </Collapse>

            {!toolbarOpen && (
                <IconButton sx={{ position: "absolute", top: 20, left: 20, zIndex: 2000, bgcolor: "rgba(25, 25, 25, 0.75)", color: "white", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }} onClick={() => setToolbarOpen(true)}>
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            )}

            <ControlPanel title="Ambient Occlusion (SSAO)" isOpen={isSsaoPanelOpen} onClose={() => setIsSsaoPanelOpen(false)}>
                <FormControlLabel control={<Switch size="small" checked={isSSAOEnabled} onChange={(e) => setIsSSAOEnabled(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff4081' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#ff4081' } }} />} label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Attiva Ombreggiamento</Typography>} />
                <Box>
                    <Typography variant="caption" color="grey.400" display="block" mb={0.5}>Intensità Ombra</Typography>
                    <Slider value={aoIntensity} onChange={(e, v) => setAoIntensity(v)} min={0} max={4} step={0.1} disabled={!isSSAOEnabled} sx={{ color: "#ff4081" }} />
                </Box>
            </ControlPanel>

            <ControlPanel title="Filtro Ottico Bagliore" isOpen={isBloomPanelOpen} onClose={() => setIsBloomPanelOpen(false)}>
                <FormControlLabel control={<Switch size="small" checked={isBloomEnabled} onChange={(e) => setIsBloomEnabled(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff4081' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#ff4081' } }} />} label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Attiva Radianza</Typography>} />
                <Box>
                    <Typography variant="caption" color="grey.400" display="block" mb={0.5}>Intensità Luce</Typography>
                    <Slider value={bloomIntensity} onChange={(e, v) => setBloomIntensity(v)} min={0} max={2} step={0.1} disabled={!isBloomEnabled} sx={{ color: "#ff4081" }} />
                </Box>
            </ControlPanel>

            <Canvas shadows dpr={dpr} gl={{ antialias: false, stencil: false, alpha: true }} camera={{ position: [0, 0, 4], fov: 45 }}>
                <Suspense fallback={<Html center><Loader /></Html>}>
                    <group ref={modelGroupRef}>
                        <StudioLights lightPresets={lightPresets} currentPresetIndex={0} modelCenter={[0,0,0]} />
                        <Environment preset="city" intensity={0.5} />
                        <ModelViewer ref={modelRef} objPath={modello?.obj_file} mtlPath={modello?.mtl_file} textureUrl={textureUrl} onLoad={handleModelLoad} />
                        {isMeasuring && <MeasurementTool />}
                        {selectedTarget === "waiting" && <AnnotationPicker onSelect={(t) => { setSelectedTarget(t); setOpenAnnotazione(true); }} modelRef={modelRef} />}
                        {showAnnotations && annotations.map(a => <AnnotationPin key={a.id} annotation={a} onClick={setSelectedAnnotation} />)}
                    </group>
                    <OrbitControls ref={controlsRef} makeDefault minDistance={1} maxDistance={30} />
                    <EffectComposer disableNormalPass={false}>
                        {isSSAOEnabled && <N8AO aoRadius={0.6} intensity={aoIntensity} quality="high" distanceFalloff={1.0} />}
                        {isBloomEnabled && <Bloom intensity={bloomIntensity} luminanceThreshold={0.3} mipmapBlur />}
                    </EffectComposer>
                </Suspense>
            </Canvas>

            <AnnotazioneForm open={openAnnotazione} onClose={() => { setOpenAnnotazione(false); setSelectedTarget(null); }} modelId={modelId} target={selectedTarget} onSaveSuccess={() => { fetchAnnotations(); setOpenAnnotazione(false); setSelectedTarget(null); setShowAnnotations(true); }} />
            <AnnotationDetailDialog open={!!selectedAnnotation} onClose={() => setSelectedAnnotation(null)} annotation={selectedAnnotation} />
            
            <Dialog open={openDescriptionDialog} onClose={() => setOpenDescriptionDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#2c3e50" }}>Dettagli del Modello</Typography>
                    <IconButton onClick={() => setOpenDescriptionDialog(false)} sx={{ color: "text.secondary" }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h6" sx={{ color: '#800020', fontWeight: 700, mb: 1 }}>{modello?.name || "Unità Archeologica"}</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{modello?.description || "Nessuna descrizione."}</Typography>
                </DialogContent>
            </Dialog>

            <Dialog open={openHelpDialog} onClose={() => setOpenHelpDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", bgcolor: "rgba(28, 28, 28, 0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", p: 1 } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Guida di Navigazione</Typography>
                    <IconButton onClick={() => setOpenHelpDialog(false)} sx={{ color: "grey.400" }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <Typography variant="body2" color="grey.300">Usa il mouse per ruotare, zoomare e trascinare il modello.</Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MyModelComponent;