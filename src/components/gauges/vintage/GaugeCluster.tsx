import React, { useState, useRef, useEffect } from 'react';
import { Group } from 'three';
import { Environment, PerspectiveCamera, OrbitControls, EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Gauge } from './Gauge';
import { gaugeConfigs } from '../../../utils/gaugeConfig';
import { materials, updateMaterialEnvironment } from '../../../materials/luxuryMaterials';
import * as THREE from 'three';

interface GaugeClusterProps {
  data: {
    quota: number;
    pipeline: number;
    revenue: number;
    activity: number;
    winrate: number;
  };
  nightMode?: boolean;
}

export const GaugeCluster: React.FC<GaugeClusterProps> = ({ data, nightMode = false }) => {
  const groupRef = useRef<Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [focusedGauge, setFocusedGauge] = useState<string | null>(null);
  const { camera } = useThree();
  
  // Startup animation
  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0.8, y: 0.8, z: 0.8 },
        { x: 1, y: 1, z: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' }
      );
      
      gsap.fromTo(
        groupRef.current.rotation,
        { y: -0.2 },
        { y: 0, duration: 2, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Handle gauge focus
  const handleGaugeClick = (gaugeId: string) => {
    if (focusedGauge === gaugeId) {
      // Reset camera
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 1,
        ease: 'power2.inOut',
      });
      setFocusedGauge(null);
    } else {
      // Focus on gauge
      const gauge = gaugeConfigs.find(g => g.id === gaugeId);
      if (gauge) {
        gsap.to(camera.position, {
          x: gauge.position[0] * 0.8,
          y: gauge.position[1] * 0.8,
          z: 3,
          duration: 1,
          ease: 'power2.inOut',
        });
        setFocusedGauge(gaugeId);
      }
    }
  };
  
  // Ambient animation
  useFrame((state) => {
    if (groupRef.current && !focusedGauge) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.02;
    }
  });
  
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={nightMode ? 0.2 : 0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={nightMode ? 0.5 : 1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[-5, 3, -5]}
        intensity={nightMode ? 0.3 : 0.5}
        color={nightMode ? '#ffaa00' : '#ffffff'}
      />
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={nightMode ? 0.5 : 0.8}
        color={nightMode ? '#ffd700' : '#ffffff'}
      />
      
      {/* Environment for reflections */}
      <Environment
        preset={nightMode ? 'night' : 'workshop'}
        background={false}
        onCreated={(envMap) => {
          if (envMap) updateMaterialEnvironment(envMap as THREE.Texture);
        }}
      />
      
      {/* Background panel */}
      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshPhysicalMaterial
          color={nightMode ? '#0a0a0a' : '#1a1a1a'}
          metalness={0}
          roughness={nightMode ? 0.95 : 0.9}
          clearcoat={0.1}
          clearcoatRoughness={0.9}
        />
      </mesh>
      
      {/* Carbon fiber texture overlay */}
      <mesh position={[0, 0, -0.99]}>
        <planeGeometry args={[10, 6]} />
        <primitive object={materials.carbonFiber} attach="material" />
      </mesh>
      
      {/* Gauge cluster group */}
      <group ref={groupRef}>
        {gaugeConfigs.map((config) => (
          <Gauge
            key={config.id}
            config={config}
            value={data[config.id as keyof typeof data]}
            nightMode={nightMode}
            onClick={() => handleGaugeClick(config.id)}
          />
        ))}
      </group>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={8}
        minDistance={2}
        maxPolarAngle={Math.PI / 2 + 0.2}
        minPolarAngle={Math.PI / 2 - 0.2}
        rotateSpeed={0.5}
      />
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={nightMode ? 0.5 : 0.2}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
        <ChromaticAberration
          offset={[0.0005, 0.0005]}
          radialModulation
          modulationOffset={0.5}
        />
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={nightMode ? 0.8 : 0.5}
        />
      </EffectComposer>
    </>
  );
};