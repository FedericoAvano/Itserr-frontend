// src/Components/Loader.jsx
import React from 'react';
import {Html, useProgress} from '@react-three/drei';

const Loader = () => {
  const {progress} = useProgress ();
  return (
    <Html center>
      <div
        style={{
          width: 260,
          background: 'rgba(0,0,0,0.85)',
          padding: 16,
          borderRadius: 12,
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'system-ui, Arial, sans-serif',
        }}
      >
        <div style={{marginBottom: 10}}>Caricamento modello 3D…</div>
        <div
          style={{
            height: 10,
            width: '100%',
            background: '#444',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#4caf50',
              transition: 'width .2s ease',
            }}
          />
        </div>
        <div style={{marginTop: 8, fontSize: 13, color: '#bbb'}}>
          {progress.toFixed (0)}%
        </div>
      </div>
    </Html>
  );
};

export default Loader;
