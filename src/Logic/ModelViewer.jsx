import React, { useEffect, useState, forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const ModelViewer = forwardRef(({ 
    objPath, 
    mtlPath, 
    textureUrl, 
    normalizeScale = true, 
    onLoad 
}, ref) => {
    const [object, setObject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const { gl } = useThree();

    const deviceSpecs = useMemo(() => ({
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        maxAnisotropy: gl.capabilities.getMaxAnisotropy(),
    }), [gl]);

    const textureBaseUrl = useMemo(() => {
        if (!mtlPath) return '';
        try {
            const url = new URL(mtlPath, window.location.origin);
            return url.pathname.substring(0, url.pathname.lastIndexOf("/") + 1);
        } catch (e) { return ''; }
    }, [mtlPath]);

    useEffect(() => {
        if (!objPath) return;

        let isMounted = true;
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        mtlLoader.setPath(textureBaseUrl);
        mtlLoader.setResourcePath(textureBaseUrl);
        mtlLoader.setCrossOrigin('anonymous');

        const loadModel = async () => {
            setLoading(true);
            try {
                let materials = null;
                if (mtlPath) {
                    materials = await new Promise((resolve) => {
                        mtlLoader.load(mtlPath, 
                            (mats) => { mats.preload(); resolve(mats); }, 
                            undefined, 
                            () => resolve(null)
                        );
                    });
                }

                if (materials) objLoader.setMaterials(materials);
                const obj = await new Promise((resolve, reject) => {
                    objLoader.load(objPath, resolve, (xhr) => {
                        if (xhr.lengthComputable) setProgress((xhr.loaded / xhr.total) * 100);
                    }, reject);
                });

                if (!isMounted) return;

                let forcedTexture = null;
                if (textureUrl) {
                    forcedTexture = await new Promise((resolve) => {
                        textureLoader.load(textureUrl, (tex) => {
                            tex.colorSpace = THREE.SRGBColorSpace;
                            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                            tex.anisotropy = deviceSpecs.maxAnisotropy;
                            tex.minFilter = THREE.LinearMipmapLinearFilter;
                            resolve(tex);
                        }, undefined, () => resolve(null));
                    });
                }

                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            child.material.side = THREE.DoubleSide;
                            if (forcedTexture && (!child.material.map || child.material.map.name === "")) {
                                child.material = new THREE.MeshStandardMaterial({
                                    map: forcedTexture,
                                    color: 0xffffff,
                                    roughness: 0.7,
                                    metalness: 0.1,
                                    side: THREE.DoubleSide,
                                    precision: deviceSpecs.isMobile ? "mediump" : "highp"
                                });
                            }
                            child.material.needsUpdate = true;
                        }
                    }
                });

                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const scale = normalizeScale ? 1.2 / Math.max(size.x, size.y, size.z) : 1;

                obj.scale.setScalar(scale);
                obj.position.sub(center.multiplyScalar(scale));

                setObject(obj);
                if (onLoad) onLoad(obj);
                setLoading(false);
            } catch (error) {
                console.error("Errore:", error);
                setLoading(false);
            }
        };

        loadModel();
        return () => { isMounted = false; };
    }, [objPath, mtlPath, textureUrl, textureBaseUrl, normalizeScale, deviceSpecs]);

    if (loading) return (
        <Html center>
            {/* Definiamo l'animazione CSS inline per assicurarci che la ruota giri */}
            <style>
                {`
                    @keyframes spin-bordeaux {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            
            <div style={loadingOverlayStyle}>
                <div style={spinnerContainerStyle}>
                    <div style={spinnerStyle}></div>
                </div>
                <span style={textStyle}>CARICAMENTO REPERTO</span>
                <span style={percentStyle}>{Math.round(progress)}%</span>
                
                <div style={progressBarStyle}>
                    <div style={{...progressFillStyle, width: `${progress}%`}}></div>
                </div>
            </div>
        </Html>
    );

    return object ? <primitive object={object} ref={ref} /> : null;
});

// --- STILI ---

const loadingOverlayStyle = { 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '35px', 
    background: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: '28px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255,255,255,0.6)',
    minWidth: '240px',
    textAlign: 'center'
};

const spinnerContainerStyle = {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const spinnerStyle = {
    width: '45px',
    height: '45px',
    border: '3px solid rgba(128, 0, 32, 0.1)', 
    borderTop: '3px solid #800020', 
    borderRadius: '50%',
    // Utilizziamo il nome della keyframe definita nello <style> sopra
    animation: 'spin-bordeaux 0.8s linear infinite',
};

const textStyle = {
    color: '#800020',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2.5px',
    marginBottom: '10px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
};

const percentStyle = {
    color: '#800020',
    fontSize: '28px',
    fontWeight: '300',
    fontFamily: 'serif',
    lineHeight: '1'
};

const progressBarStyle = {
    width: '100%',
    height: '4px',
    background: 'rgba(128, 0, 32, 0.08)',
    borderRadius: '10px',
    marginTop: '20px',
    overflow: 'hidden'
};

const progressFillStyle = {
    height: '100%',
    background: '#800020',
    transition: 'width 0.4s cubic-bezier(0.1, 0.7, 1.0, 0.1)'
};

export default ModelViewer;