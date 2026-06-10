// src/Logic/3DTools/MeasurementTool.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const MeasurementTool = () => {
  const { camera, gl, scene } = useThree();
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [currentMousePoint, setCurrentMousePoint] = useState(null);
  const scaleFactor = 10; // 1 unit = 10 cm

  // Ottieni oggetti cliccabili
  const getIntersectableObjects = useCallback(() => {
    const objects = [];
    scene.traverse((child) => {
      if (child.isMesh) objects.push(child);
    });
    return objects;
  }, [scene]);

  // Muovi mouse = aggiorna "preview" del secondo punto
  const handlePointerMove = useCallback(
    (event) => {
      if (points.length === 1) {
        const mouse = new THREE.Vector2(
          (event.clientX / gl.domElement.clientWidth) * 2 - 1,
          -(event.clientY / gl.domElement.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(getIntersectableObjects());

        setCurrentMousePoint(intersects.length > 0 ? intersects[0].point : null);
      }
    },
    [camera, gl.domElement, getIntersectableObjects, points.length]
  );

  // Click = aggiungi punti
  const handleClick = useCallback(
    (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(getIntersectableObjects());

      if (intersects.length > 0) {
        const p = intersects[0].point;
        setPoints((prev) => {
          if (prev.length === 1) {
            const finalPoints = [prev[0], p];
            const dist = prev[0].distanceTo(p);
            setDistance((dist * scaleFactor).toFixed(2));
            setCurrentMousePoint(null);
            return finalPoints;
          } else {
            setDistance(null);
            return [p];
          }
        });
      }
    },
    [camera, gl, getIntersectableObjects, scaleFactor]
  );

  // Attiva/disattiva listener
  useEffect(() => {
    gl.domElement.style.cursor = "crosshair";
    gl.domElement.addEventListener("click", handleClick);
    gl.domElement.addEventListener("pointermove", handlePointerMove);

    return () => {
      gl.domElement.style.cursor = "default";
      gl.domElement.removeEventListener("click", handleClick);
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handleClick, handlePointerMove, gl.domElement]);

  // Prepara punti per la linea
  const linePoints =
    points.length === 1 && currentMousePoint
      ? [points[0], currentMousePoint]
      : points.length === 2
      ? points
      : null;

  return (
    <>
      {/* 🔹 Disegna linea */}
      {linePoints && (
        <line>
          <bufferGeometry
            attach="geometry"
            attributes={{
              position: new THREE.BufferAttribute(
                new Float32Array(linePoints.flatMap((p) => p.toArray())),
                3
              ),
            }}
          />
          <lineBasicMaterial attach="material" color="red" linewidth={2} />
        </line>
      )}

      {/* 🔹 Disegna piccoli pallini rossi ai punti */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.005, 16, 16]} /> {/* piccolo raggio */}
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
      {currentMousePoint && points.length === 1 && (
        <mesh position={currentMousePoint}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="orange" /> {/* preview in arancione */}
        </mesh>
      )}

      {/* 🔹 Testo della misura */}
      {distance && (
        <Html>
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 20,
              color: "white",
              background: "rgba(0,0,0,0.7)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontFamily: "monospace",
              pointerEvents: "none",
              zIndex: 3000,
            }}
          >
            📏 {distance} cm
          </div>
        </Html>
      )}
    </>
  );
};

export default MeasurementTool;
