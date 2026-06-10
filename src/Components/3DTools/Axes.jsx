import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const Axes = ({ size = 5, position = [0, 0, 0] }) => {
  const { scene } = useThree();
  useEffect(() => {
    const axesHelper = new THREE.AxesHelper(size);
    axesHelper.position.set(...position); // Imposta la posizione qui
    scene.add(axesHelper);
    return () => {
      scene.remove(axesHelper);
    };
  }, [scene, size, position]);
  return null;
};