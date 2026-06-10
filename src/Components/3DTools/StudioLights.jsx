// src/Components/3DTools/StudioLights.jsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight } from "@react-three/drei";
import { SpotLightHelper, DirectionalLightHelper } from "three"; 
import { GodRays } from "@react-three/postprocessing";
import * as THREE from "three";

const StudioLights = ({
  lightPresets,
  currentPresetIndex,
  modelCenter,
  showHelpers,
  freeMode,
  lightPositions,
  onPositionChange,
  orbitControlsRef,
  shadowMapSize = 2048, // Aggiunto valore di default per completezza
  enableHardShadows = true 
}) => {
  const volumetricLightRef = useRef();
  const freeLightRefs = useRef([]);

  useFrame(() => {
    // 🚨 CORREZIONE: Uso del chaining opzionale '?.current' per evitare il TypeError
    const controls = orbitControlsRef?.current;

    if (controls) {
      if (showHelpers && freeMode) {
        // Disabilita i controlli in modalità Free Light con Helper attivi per permettere il drag
        controls.enabled = false;
      } else {
        // Abilita i controlli normalmente
        controls.enabled = true;
      }
    }
  });

  // La destrutturazione era già protetta in MyModelComponent grazie al preset completo.
  const currentPreset = lightPresets[currentPresetIndex];
  // Assumendo che i preset siano completi (come corretto in MyModelComponent)
  const { directional, ambient, enableRays } = currentPreset; 

  // Gestione del preset "Libera"
  if (freeMode) {
    return (
      <>
        {/* Ambient Light for Free Mode */}
        <ambientLight intensity={ambient.intensity} color={ambient.color} />
        
        {/* Directional Lights per le posizioni libere */}
        {lightPositions.map((pos, index) => (
          <directionalLight
            key={index}
            position={pos}
            intensity={1.5}
            color="#fff"
            castShadow={enableHardShadows}
            ref={el => freeLightRefs.current[index] = el}
          />
        ))}
        {/* Helper per le luci libere */}
        {showHelpers && freeLightRefs.current.map((light, index) => (
          // Controlla se 'light' esiste prima di creare l'Helper
          light && <primitive key={index} object={new DirectionalLightHelper(light, 1)} />
        ))}
      </>
    );
  }

  // Renderizza la luce volumetrica e il suo effetto
  if (enableRays && directional.length > 0) {
    return (
      <>
        <ambientLight intensity={ambient.intensity} color={ambient.color} />
        <spotLight
          ref={volumetricLightRef}
          castShadow={enableHardShadows} 
          position={directional[0].position}
          angle={Math.PI / 10}
          penumbra={0.2}
          distance={100}
          color={directional[0].color}
          intensity={directional[0].intensity}
          target-position={modelCenter}
          shadow-mapSize-width={shadowMapSize} // Aggiunti shadow props
          shadow-mapSize-height={shadowMapSize}
        />
        {/* Helper per la luce volumetrica */}
        {showHelpers && volumetricLightRef.current && (
          <primitive
            object={new SpotLightHelper(volumetricLightRef.current)}
            dispose={null}
          />
        )}
        {/* Effetto GodRays */}
        {volumetricLightRef.current && (
          <GodRays
            sun={volumetricLightRef.current}
            blendFunction={THREE.AdditiveBlending}
            samples={60}
            density={0.96}
            decay={0.94}
            scattering={0.8}
            clampMax={1}
          />
        )}
      </>
    );
  }

  // Renderizza le luci standard per tutti gli altri preset
  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      {directional.map((light, index) => {
        const shouldCastShadow = enableHardShadows && light.castShadow;
        
        const lightProps = {
          position: light.position,
          intensity: light.intensity,
          color: light.color,
          castShadow: shouldCastShadow,
        };

        if (shouldCastShadow) {
          return (
            <directionalLight
              key={index}
              {...lightProps}
              shadow-mapSize-width={shadowMapSize} 
              shadow-mapSize-height={shadowMapSize}
              shadow-camera-near={0.5}
              shadow-camera-far={50}
            />
          );
        } else {
          return <directionalLight key={index} {...lightProps} />;
        }
      })}
    </>
  );
};

export default StudioLights;