// Components/3DTools/AnnotationPicker.jsx
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Line, Html } from '@react-three/drei';

// =========================================================
// SIMULAZIONE IA 3D: PUNTI DI INTERESSE PRE-CALCOLATI (POIs)
// =========================================================
// In una implementazione reale, questi sarebbero i vertici importanti o i punti
// chiave identificati da un modello di Segmentazione 3D (es. bordi, angoli, ecc.).
// Li simuliamo qui come un array statico di Vector3 per dimostrare la logica di snapping.
const SIMULATED_FEATURE_POIS = [
    // Punti di un ipotetico bordo sul modello (da adattare al tuo modello specifico)
    new THREE.Vector3(1.0, 0.5, 0.0),
    new THREE.Vector3(0.8, 0.5, 0.2),
    new THREE.Vector3(0.5, 0.5, 0.3),
    new THREE.Vector3(0.3, 0.5, 0.5),
    new THREE.Vector3(0.0, 0.5, 0.7), 
];


const AnnotationPicker = ({ onSelect, modelRef }) => {
    const { gl, camera } = useThree();
    const [vertices, setVertices] = useState([]); 
    const [currentPreviewPoint, setCurrentPreviewPoint] = useState(null); 
    const [iaSuggestion, setIaSuggestion] = useState(null); 
    const raycaster = useRef(new THREE.Raycaster());
    
    // Soglia per lo Snapping sul primo punto per la chiusura del poligono
    const CLOSE_DISTANCE_THRESHOLD = 0.1; 
    // Soglia per lo Snapping sui POIs del Modello (Feature Snapping)
    const FEATURE_SNAPPING_THRESHOLD = 0.05; // Più piccolo per un aggancio preciso

    // =========================================================
    // LOGICA DI SNAPPING INTELLIGENTE (IA Driven)
    // =========================================================

    /**
     * Verifica se un punto di hit è vicino a un Vertice di chiusura o a un POI di Feature.
     * @param {THREE.Vector3} hitPoint - Il punto di intersezione attuale del cursore.
     * @returns {Object|null} Suggerimento di chiusura, snapping o null.
     */
    const getSmartSuggestion = useCallback((hitPoint) => {
        const minVerticesForPolygon = 3; 

        // 1. SUGGERIMENTO DI CHIUSURA (Snapping sul Primo Vertice)
        if (vertices.length >= minVerticesForPolygon && hitPoint) {
            const firstPoint = vertices[0];
            const distance = firstPoint.distanceTo(hitPoint);
            
            if (distance < CLOSE_DISTANCE_THRESHOLD) {
                return {
                    type: 'close_polygon',
                    point: firstPoint, 
                    message: `IA: Vicino alla chiusura (Clicca/Destro)`,
                    isClose: true, 
                };
            }
        }
        
        // 2. FEATURE SNAPPING (Aggancio IA ai POIs pre-calcolati)
        // Cerca il POI più vicino all'hitPoint
        let minDistance = Infinity;
        let bestPOI = null;

        for (const poi of SIMULATED_FEATURE_POIS) {
            const distance = poi.distanceTo(hitPoint);
            if (distance < minDistance) {
                minDistance = distance;
                bestPOI = poi;
            }
        }

        if (bestPOI && minDistance < FEATURE_SNAPPING_THRESHOLD) {
             // Se l'hitPoint è molto vicino a un POI (bordo, vertice, ecc.)
             return {
                 type: 'feature_snapping',
                 point: bestPOI, // L'IA suggerisce di usare il punto POI (più preciso)
                 message: 'IA: Aggancio a Feature geometrica.',
                 isSnapping: true,
             };
        }

        return null;
    }, [vertices, CLOSE_DISTANCE_THRESHOLD, FEATURE_SNAPPING_THRESHOLD]);


    // =========================================================
    // FUNZIONI DI BASE (invariate)
    // =========================================================
    
    const intersectModel = useCallback((mouse, targetModelRef) => {
        if (!targetModelRef || !targetModelRef.current) return [];
        raycaster.current.setFromCamera(mouse, camera);
        const modelObject = targetModelRef.current;
        const intersectableObjects = modelObject.isGroup ? modelObject.children : [modelObject];
        return raycaster.current.intersectObjects(intersectableObjects, true);
    }, [camera]);


    const handleClick = useCallback(event => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            (event.clientX - rect.left) / rect.width * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const intersects = intersectModel(mouse, modelRef);
        
        // --- 1. ANNULLAMENTO / CHIUSURA (Tasto Destro)
        if (event.button === 2) {
            event.preventDefault(); 
            
            if (vertices.length >= 3) {
                onSelect({ type: '3D-Polygon', coordinates: [...vertices] });
            } else if (vertices.length > 0) {
                 onSelect(null);
            } else if (intersects.length > 0) { 
                 onSelect(intersects[0].point);
            } else {
                 onSelect(null);
            }
            
            setVertices([]); 
            setIaSuggestion(null);
            return;
        }

        // --- 2. INTERSEZIONE e AGGIUNTA VERTICE (Tasto Sinistro)
        if (intersects.length > 0 && event.button === 0) {
            const hitPoint = intersects[0].point;
            
            const suggestion = getSmartSuggestion(hitPoint);
            let pointToUse = hitPoint; // Punto di default

            if (suggestion?.isClose) {
                // Chiusura accettata
                onSelect({ type: '3D-Polygon', coordinates: [...vertices] });
                setVertices([]);
                setIaSuggestion(null);
                return;
            } else if (suggestion?.isSnapping) {
                 // 💥 Se l'IA suggerisce lo Snapping, usiamo il punto POI
                 pointToUse = suggestion.point; 
            }
            
            // AGGIUNTA VERTICE (potrebbe essere il punto POI snappato)
            setVertices(prev => [...prev, pointToUse]);
        }
    }, [gl, vertices, onSelect, modelRef, intersectModel, getSmartSuggestion]);


    const handlePointerMove = useCallback(event => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            (event.clientX - rect.left) / rect.width * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const intersects = intersectModel(mouse, modelRef);
        
        if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            
            const suggestion = getSmartSuggestion(hitPoint);
            setIaSuggestion(suggestion); 
            
            if (suggestion?.isClose || suggestion?.isSnapping) {
                // Aggancia il cursore al punto suggerito (primo vertice o POI)
                setCurrentPreviewPoint(suggestion.point);
            } else {
                // Altrimenti, usa il punto di intersezione del mouse
                setCurrentPreviewPoint(hitPoint); 
            }
        } else {
            setCurrentPreviewPoint(null);
            setIaSuggestion(null);
        }
    }, [gl, modelRef, intersectModel, getSmartSuggestion]);

    // -----------------------------------------------------------
    // EFFETTI: Listener e Clean-up (invariati)
    // -----------------------------------------------------------
    useEffect(() => {
        const element = gl.domElement;
        const handleContextMenu = (e) => e.preventDefault(); 
        
        element.addEventListener('click', handleClick);
        element.addEventListener('pointermove', handlePointerMove);
        element.addEventListener('contextmenu', handleClick); 
        element.addEventListener('contextmenu', handleContextMenu, false);
        
        return () => {
            element.removeEventListener('click', handleClick);
            element.removeEventListener('pointermove', handlePointerMove);
            element.removeEventListener('contextmenu', handleClick);
            element.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleClick, handlePointerMove, gl]);


    // -----------------------------------------------------------
    // RENDERING DEI PUNTI E DELLE LINEE
    // -----------------------------------------------------------
    
    const linePoints = vertices.map(v => new THREE.Vector3(v.x, v.y, v.z));
    
    if (vertices.length >= 1 && currentPreviewPoint) {
        linePoints.push(new THREE.Vector3(currentPreviewPoint.x, currentPreviewPoint.y, currentPreviewPoint.z));
    }
    
    const isPolygonClosed = iaSuggestion?.isClose && vertices.length >= 3;

    if (isPolygonClosed) {
        // La Linea finale chiude sul primo vertice
        linePoints[linePoints.length - 1] = linePoints[0];
    }
    
    // Colore lime per lo Snapping/Chiusura, ciano per lo Snapping di Feature
    let lineColor = "yellow";
    if (isPolygonClosed) {
        lineColor = "lime";
    } else if (iaSuggestion?.isSnapping) {
         lineColor = "cyan"; // Un nuovo colore per distinguere lo Snapping POI
    }

    return (
        <group name="annotation-picker-ui">
            {/* Disegna i Punti di Interesse IA pre-calcolati (Solo per debug/visualizzazione) */}
            {SIMULATED_FEATURE_POIS.map((p, index) => (
                 <mesh key={`poi-${index}`} position={p}>
                    <sphereGeometry args={[0.01, 8, 8]} />
                    <meshBasicMaterial color="red" transparent opacity={0.5} />
                 </mesh>
            ))}

            {/* Disegna i punti di ancoraggio */}
            {vertices.map((v, index) => (
                <mesh key={index} position={v}>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshBasicMaterial color={index === 0 ? lineColor : "yellow"} />
                </mesh>
            ))}
            
            {/* Disegna le linee tra i punti */}
            {vertices.length > 0 && (
                <Line 
                    points={linePoints} 
                    color={lineColor} 
                    lineWidth={2} 
                />
            )}

            {/* Visualizzazione del suggerimento IA */}
            {iaSuggestion && (
                <Html 
                    position={iaSuggestion.point} 
                    distanceFactor={0.5}
                >
                    <div 
                        style={{
                            background: lineColor, 
                            color: 'black', 
                            padding: '5px 10px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            transform: 'translate(-50%, -120%)',
                            pointerEvents: 'none' 
                        }}
                    >
                        {iaSuggestion.message}
                    </div>
                </Html>
            )}
        </group>
    );
};

export default AnnotationPicker;