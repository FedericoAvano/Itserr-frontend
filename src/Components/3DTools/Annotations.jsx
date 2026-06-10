import React, { useState } from 'react';
import { Sphere } from "@react-three/drei";
import { Vector3 } from 'three';

/**
 * Funzione di utilità per estrarre le coordinate 3D da un oggetto annotazione.
 * @param {object} annotation L'oggetto annotazione ricevuto dal backend.
 * @returns {THREE.Vector3 | null} La posizione 3D o null se non valida.
 */
const parseCoordinates = (annotation) => {
    // --- 1. Tenta di leggere il NUOVO formato W3C (target.selector.value) ---
    const w3cValue = annotation?.target?.selector?.value;
    
    if (w3cValue) {
        let coordsArray = null;

        try {
            // TENTATIVO A: La stringa è un array JSON standard (es. "[1.2, 0.5, -2.0]")
            coordsArray = JSON.parse(w3cValue);
            
            // Verifica che sia un array di 3 numeri
            if (Array.isArray(coordsArray) && coordsArray.length === 3 && coordsArray.every(c => typeof c === 'number')) {
                return new Vector3(coordsArray[0], coordsArray[1], coordsArray[2]);
            }
        } catch (e) {
            // console.warn("Il parsing JSON del selettore è fallito, provando il formato key=value...", w3cValue);
        }

        // TENTATIVO B: La stringa è nel formato "key=value;key=value" (il formato che avevi previsto)
        // La conserviamo per retrocompatibilità.
        const parts = String(w3cValue).split(';').reduce((acc, part) => {
             const [key, val] = part.split('=');
             if (key && val) {
                 acc[key.trim()] = parseFloat(val.trim());
             }
             return acc;
        }, {});
        
        if (!isNaN(parts.x) && !isNaN(parts.y) && !isNaN(parts.z)) {
             return new Vector3(parts.x, parts.y, parts.z);
        }
    }
    
    // --- 2. FALLBACK: Tenta di leggere il VECCHIO formato (campi diretti) ---
    // Questi campi devono essere numeri, se sono stringhe JSON "[...]" falliscono
    // la verifica '!== null'. Se i tuoi vecchi campi sono stringhe, il bug è altrove.
    if (
        annotation.posizione_x !== undefined && annotation.posizione_x !== null &&
        annotation.posizione_y !== undefined && annotation.posizione_y !== null &&
        annotation.posizione_z !== undefined && annotation.posizione_z !== null
    ) {
        return new Vector3(
            annotation.posizione_x, 
            annotation.posizione_y, 
            annotation.posizione_z
        );
    }
    
    // Se nessuno dei due formati è valido, ritorna null
    return null;
};


const Annotations = ({ annotations, onAnnotationClick }) => {
    // Stato locale per gestire l'effetto hover su tutte le sfere, anche se non è l'ideale.
    const [hovered, setHovered] = useState(false);

    return (
        <group name="Annotations_Container">
            {annotations.map((annotation) => {
                
                const position = parseCoordinates(annotation);

                // Se la posizione non è valida (null), salta l'annotazione
                if (!position) {
                    // 💡 SUGGERIMENTO DEBUG: Aggiungi un log qui per vedere cosa non è valido!
                    // console.log("Annotazione saltata per posizione non valida:", annotation);
                    return null;
                }

                // 💡 Verifica Sanity Check: Stampa la posizione finale
                // console.log("Rendering pin a:", position.toArray());

                // Il resto della logica di rendering è corretto
                return (
                    <Sphere
                        key={annotation.w3c_id || annotation.id} 
                        args={[0.03, 16, 16]}
                        position={position}
                        onClick={(e) => {
                            // IMPORTANTE: Ferma la propagazione per non interferire con OrbitControls o MeasurementTool
                            e.stopPropagation(); 
                            if (onAnnotationClick) {
                                onAnnotationClick(annotation);
                            }
                        }}
                        onPointerOver={() => {
                            document.body.style.cursor = 'pointer';
                            setHovered(true);
                        }}
                        onPointerOut={() => {
                            document.body.style.cursor = 'auto';
                            setHovered(false);
                        }}
                    >
                        <meshStandardMaterial 
                            color={hovered ? "lightblue" : "red"} 
                            emissive={hovered ? "lightblue" : "red"} 
                            emissiveIntensity={1} 
                        />
                    </Sphere>
                );
            })}
        </group>
    );
};

export default Annotations;