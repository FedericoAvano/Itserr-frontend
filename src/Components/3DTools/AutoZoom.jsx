// src/Components/3DTools/AutoZoom.jsx
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function AutoZoom({ targetRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!targetRef.current) return;
    const obj = targetRef.current;
    
    // Calcola la bounding box del modello
    const boxScaled = new THREE.Box3().setFromObject(obj);
    const finalSize = boxScaled.getSize(new THREE.Vector3());
    const maxDimFinal = Math.max(finalSize.x, finalSize.y, finalSize.z) || 1;
    
    // Calcola la distanza minima per inquadrare il modello
    const fov = (camera.fov * Math.PI) / 180;
    let cameraZ = maxDimFinal / (2 * Math.tan(fov / 2));
    
    // ✅ Riduci il fattore di moltiplicazione per avvicinare ulteriormente la telecamera.
    // Un valore tra 1.1 e 1.3 è un buon punto di partenza.
    cameraZ *= 1.25; // Valore suggerito

    // Posiziona la telecamera e aggiorna la scena
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log("Auto-zoom completato");
  }, [camera, targetRef]);

  return null;
}