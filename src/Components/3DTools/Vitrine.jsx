import React from 'react';

function Vitrine({ children }) {
  return (
    <group position={[0, 0.05, 0]}>
      {/* Base della teca (in basso) */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Vetro della teca (le pareti) */}
      <mesh>
        <boxGeometry args={[3.2, 2, 3.2]} />
        <meshPhysicalMaterial
          color="white"
          transparent={true}
          opacity={0.15}
          roughness={0.05}
          metalness={0.05}
          ior={1.2}
          reflectivity={0.5}
        />
      </mesh>
      {children} {/* Qui verrà renderizzato il tuo modello archeologico */}
    </group>
  );
}

export default Vitrine;