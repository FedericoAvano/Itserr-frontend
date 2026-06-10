// src/Logic/StretchedBackgroundPlane.jsx
import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shader per la fascia di texture
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uBandWidth;
  uniform float uFade;

  varying vec2 vUv;

  void main() {
    // Calcola la distanza dal centro verticale (0.5)
    float distanceFromCenter = abs(vUv.y - 0.5);
    
    // Calcola il valore di mascheratura della fascia
    float mask = smoothstep(uBandWidth, uBandWidth + uFade, distanceFromCenter);
    
    // Inverti la maschera per mostrare la parte centrale
    mask = 1.0 - mask;
    
    // Ottieni il colore della texture
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Applica la maschera all'opacità della texture
    gl_FragColor = vec4(textureColor.rgb, textureColor.a * mask);
  }
`;

const StretchedBackgroundPlane = ({ isVisible, textureMap, modelCenter }) => {
  const planeRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.visible = isVisible;
    }
  }, [isVisible]);

  useFrame(() => {
    if (planeRef.current && isVisible && textureMap) {
      const distance = camera.position.distanceTo(new THREE.Vector3(modelCenter[0], modelCenter[1], modelCenter[2]));
      const planeDistance = distance * 0.8; 
      
      const targetPosition = new THREE.Vector3(modelCenter[0], modelCenter[1], modelCenter[2]);
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      planeRef.current.position.copy(targetPosition).add(cameraDirection.multiplyScalar(-planeDistance));
      planeRef.current.lookAt(camera.position);

      const frustumHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * planeDistance;
      const frustumWidth = frustumHeight * camera.aspect;
      
      planeRef.current.scale.set(frustumWidth * 1.5, frustumHeight * 1.5, 1);
    }
  });

  if (!textureMap) return null;

  return (
    <mesh ref={planeRef} visible={isVisible}>
      <planeGeometry args={[1, 1]} />
      {/* Sostituisci il MeshBasicMaterial con uno ShaderMaterial */}
      <shaderMaterial
        uniforms={{
          uTexture: { value: textureMap },
          uBandWidth: { value: 0.15 }, // Larghezza della banda visibile (valore tra 0 e 0.5)
          uFade: { value: 0.15 }, // Larghezza del gradiente di dissolvenza (valore tra 0 e 0.5)
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default StretchedBackgroundPlane;